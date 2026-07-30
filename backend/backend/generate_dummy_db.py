import sqlite3
import random

conn = sqlite3.connect('dummy_test.db')
c = conn.cursor()
c.execute('''CREATE TABLE IF NOT EXISTS sales
             (id INTEGER PRIMARY KEY, product TEXT, quantity INTEGER, price REAL, revenue REAL)''')
c.execute('DELETE FROM sales')

products = ['Laptop', 'Smartphone', 'Tablet', 'Monitor', 'Keyboard']
for i in range(20):
    product = random.choice(products)
    quantity = random.randint(1, 10)
    price = round(random.uniform(50.0, 1500.0), 2)
    revenue = quantity * price
    c.execute('INSERT INTO sales (product, quantity, price, revenue) VALUES (?, ?, ?, ?)',
              (product, quantity, price, revenue))

conn.commit()
conn.close()
print("Created dummy_test.db")
