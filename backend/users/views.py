from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from .serializers import RegisterSerializer, UserSerializer
from django.contrib.auth import get_user_model
from django.core.mail import send_mail
from django.utils import timezone
from datetime import timedelta
from .models import OTP
from google.oauth2 import id_token
from google.auth.transport import requests

User = get_user_model()

def send_otp_email(user_or_email, purpose, registration_data=None):
    code = OTP.generate_code()
    expires_at = timezone.now() + timedelta(minutes=4)
    
    if isinstance(user_or_email, User):
        user = user_or_email
        email = user.email
        OTP.objects.filter(user=user, purpose=purpose).delete()
        OTP.objects.create(user=user, code=code, purpose=purpose, expires_at=expires_at)
    else:
        email = user_or_email
        OTP.objects.filter(email=email, purpose=purpose).delete()
        OTP.objects.create(email=email, registration_data=registration_data, code=code, purpose=purpose, expires_at=expires_at)
    
    subject = "Verification Code" if purpose == "registration" else "Password Reset Code"
    message = f"Your one-time password is: {code}\nIt will expire in 4 minutes."
    try:
        send_mail(subject, message, None, [email])
    except Exception as e:
        print(f"Failed to send email: {e}")

class UserMeView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        serializer = UserSerializer(request.user)
        return Response(serializer.data)
        
    def delete(self, request):
        request.user.delete()
        return Response({"message": "User deleted successfully."})

class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    permission_classes = (permissions.AllowAny,)
    serializer_class = RegisterSerializer

    def post(self, request, *args, **kwargs):
        email = request.data.get('email')
        try:
            existing_user = User.objects.get(email=email)
            return Response({"email": ["A user with that email already exists."]}, status=status.HTTP_400_BAD_REQUEST)
        except User.DoesNotExist:
            pass

        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        # Don't save the user yet, save the data in the OTP
        send_otp_email(email, 'registration', registration_data=request.data)
        
        return Response({
            "message": "Registration successful. Please check your email for the OTP.",
            "requires_verification": True,
            "email": email
        }, status=status.HTTP_201_CREATED)

class VerifyEmailOTPView(APIView):
    permission_classes = (permissions.AllowAny,)

    def post(self, request):
        email = request.data.get('email')
        code = request.data.get('otp')
        
        # Check new flow (unregistered user OTP)
        new_otp = OTP.objects.filter(email=email, purpose='registration', code=code).first()
        if new_otp:
            if new_otp.is_valid():
                reg_data = new_otp.registration_data or {}
                user = User.objects.create_user(
                    username=reg_data.get('username', email),
                    email=email,
                    password=reg_data.get('password'),
                    first_name=reg_data.get('first_name', ''),
                    last_name=reg_data.get('last_name', ''),
                    is_active=True
                )
                new_otp.delete()
                refresh = RefreshToken.for_user(user)
                return Response({
                    "user": UserSerializer(user).data,
                    "refresh": str(refresh),
                    "access": str(refresh.access_token),
                })
            else:
                return Response({"error": "OTP has expired."}, status=status.HTTP_400_BAD_REQUEST)

        # Fallback to old flow
        try:
            user = User.objects.get(email=email)
            otp = OTP.objects.get(user=user, purpose='registration', code=code)
            if otp.is_valid():
                user.is_active = True
                user.save()
                otp.delete()
                refresh = RefreshToken.for_user(user)
                return Response({
                    "user": UserSerializer(user).data,
                    "refresh": str(refresh),
                    "access": str(refresh.access_token),
                })
            else:
                return Response({"error": "OTP has expired."}, status=status.HTTP_400_BAD_REQUEST)
        except (User.DoesNotExist, OTP.DoesNotExist):
            return Response({"error": "Invalid OTP or email."}, status=status.HTTP_400_BAD_REQUEST)

class ResendRegistrationOTPView(APIView):
    permission_classes = (permissions.AllowAny,)

    def post(self, request):
        email = request.data.get('email')
        try:
            user = User.objects.get(email=email)
            return Response({"error": "User is already verified."}, status=status.HTTP_400_BAD_REQUEST)
        except User.DoesNotExist:
            pass
            
        old_otp = OTP.objects.filter(email=email, purpose='registration').order_by('-created_at').first()
        if old_otp and old_otp.registration_data:
            send_otp_email(email, 'registration', registration_data=old_otp.registration_data)
            return Response({"message": "A new verification code has been sent."})
        else:
            return Response({"error": "No pending registration found for this email."}, status=status.HTTP_400_BAD_REQUEST)

class ForgotPasswordView(APIView):
    permission_classes = (permissions.AllowAny,)

    def post(self, request):
        email = request.data.get('email')
        try:
            user = User.objects.get(email=email)
            send_otp_email(user, 'reset_password')
            return Response({"message": "An OTP has been sent to your email."})
        except User.DoesNotExist:
            return Response({"error": "No account found with this email address."}, status=status.HTTP_404_NOT_FOUND)

class ResetPasswordView(APIView):
    permission_classes = (permissions.AllowAny,)

    def post(self, request):
        email = request.data.get('email')
        code = request.data.get('otp')
        new_password = request.data.get('new_password')
        
        try:
            user = User.objects.get(email=email)
            otp = OTP.objects.get(user=user, purpose='reset_password', code=code)
            if otp.is_valid():
                user.set_password(new_password)
                user.save()
                otp.delete()
                return Response({"message": "Password reset successful."})
            else:
                return Response({"error": "OTP has expired."}, status=status.HTTP_400_BAD_REQUEST)
        except (User.DoesNotExist, OTP.DoesNotExist):
            return Response({"error": "Invalid OTP or email."}, status=status.HTTP_400_BAD_REQUEST)

class GoogleLoginView(APIView):
    permission_classes = (permissions.AllowAny,)

    def post(self, request):
        token = request.data.get('credential')
        access_token = request.data.get('access_token')
        
        if not token and not access_token:
            return Response({"error": "No credential or access token provided"}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            if access_token:
                import requests as req
                resp = req.get('https://www.googleapis.com/oauth2/v3/userinfo', params={'access_token': access_token})
                if resp.status_code != 200:
                    return Response({"error": "Invalid Google access token"}, status=status.HTTP_400_BAD_REQUEST)
                idinfo = resp.json()
            else:
                idinfo = id_token.verify_oauth2_token(token, requests.Request(), clock_skew_in_seconds=10)
                
            email = idinfo.get('email')
            first_name = idinfo.get('given_name', '')
            last_name = idinfo.get('family_name', '')
            
            user, created = User.objects.get_or_create(email=email, defaults={
                'first_name': first_name,
                'last_name': last_name,
                'username': email,
                'is_active': True
            })
            
            if created:
                user.set_unusable_password()
                user.save()
            
            if not user.is_active:
                user.is_active = True
                user.save()
                
            refresh = RefreshToken.for_user(user)
            return Response({
                "user": UserSerializer(user).data,
                "refresh": str(refresh),
                "access": str(refresh.access_token),
            })
        except ValueError as e:
            return Response({"error": "Invalid token"}, status=status.HTTP_400_BAD_REQUEST)
