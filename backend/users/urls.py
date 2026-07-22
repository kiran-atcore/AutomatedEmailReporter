from django.urls import path
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from .views import RegisterView, UserMeView

urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path('me/', UserMeView.as_view(), name='me'),
    path('login/', TokenObtainPairView.as_view(), name='login'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
]
