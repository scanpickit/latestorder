import requests

def check_payment_status(order_id):
    url = f"https://sandbox.cashfree.com/pg/orders/{order_id}"
    headers = {
        "x-client-id": "TEST4143386d2b7e9c0c011a9417ce833414",
        "x-client-secret": "cfsk_ma_test_d60959ad9330ef7cbe2c312a33f2e714_391ae568",
        "x-api-version": "2021-05-21"
    }

    response = requests.get(url, headers=headers)
    if response.status_code == 200:
        result = response.json()
        if result["order_status"] == "PAID":
            return "This order is paid!"
        else:
            return "Order has not been paid!"
    else:
        return "Error: " + response.text

# Usage example
payment_status = check_payment_status(order_id)
print(payment_status)
