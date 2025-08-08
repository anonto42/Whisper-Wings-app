export const PaymentSuccessPage = (amount: any) => `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Payment Success</title>
    <link rel="stylesheet" href="styles.css">
    <style>
        body {
            font-family: Arial, sans-serif;
            background-color: #f4f4f4;
            margin: 0;
            padding: 0;
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
        }
        .container {
            background-color: white;
            padding: 40px;
            text-align: center;
            border-radius: 8px;
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
            max-width: 600px;
            width: 100%;
        }
        .container h1 {
            font-size: 2.5rem;
            color: #28a745;
        }
        .container p {
            font-size: 1.2rem;
            color: #555;
        }
        .amount {
            font-size: 2rem;
            font-weight: bold;
            color: #28a745;
        }
        .button {
            display: inline-block;
            margin-top: 20px;
            padding: 10px 20px;
            background-color: #007bff;
            color: white;
            text-decoration: none;
            border-radius: 4px;
            font-size: 1rem;
        }
        .button:hover {
            background-color: #0056b3;
        }
    </style>
</head>
<body>

<div class="container">
    <h1>Payment Successful!</h1>
    <p>Thank you. Your payment has been successfully processed.</p>
    
    <p>Your amount: <span class="amount">$${amount}</span></p> 
    
    <!-- <a href="/dashboard" class="button">Go to Dashboard</a> Redirect to user's dashboard or another relevant page -->
</div>

</body>
</html>
`
export const PyamentCancel = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Payment Canceled</title>
    <link rel="stylesheet" href="styles.css">
    <style>
        body {
            font-family: Arial, sans-serif;
            background-color: #f4f4f4;
            margin: 0;
            padding: 0;
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
        }
        .container {
            background-color: white;
            padding: 40px;
            text-align: center;
            border-radius: 8px;
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
            max-width: 600px;
            width: 100%;
        }
        .container h1 {
            font-size: 2.5rem;
            color: #dc3545;
        }
        .container p {
            font-size: 1.2rem;
            color: #555;
        }
        .button {
            display: inline-block;
            margin-top: 20px;
            padding: 10px 20px;
            background-color: #007bff;
            color: white;
            text-decoration: none;
            border-radius: 4px;
            font-size: 1rem;
        }
        .button:hover {
            background-color: #0056b3;
        }
    </style>
</head>
<body>

<div class="container">
    <h1>Payment Canceled</h1>
    <p>Your payment has been canceled. You should try again.</p>
    
</div>

</body>
</html>
`
export const PyamentFailed = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Payment Status</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      background-color: #f7f7f7;
      color: #333;
      padding: 20px;
      text-align: center;
    }
    .container {
      background-color: #fff;
      border: 1px solid #ddd;
      padding: 20px;
      border-radius: 8px;
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
      max-width: 600px;
      margin: 0 auto;
    }
    h1 {
      color: #f44336;
    }
    p {
      font-size: 16px;
      margin: 20px 0;
    }
    .btn {
      background-color: #2196F3;
      color: white;
      padding: 10px 20px;
      border: none;
      border-radius: 5px;
      cursor: pointer;
      text-decoration: none;
      font-size: 16px;
    }
    .btn:hover {
      background-color: #1976d2;
    }
    .error-icon {
      font-size: 50px;
      color: #f44336;
    }
  </style>
</head>
<body>

  <div class="container">
    <div class="error-icon">&#9888;</div> <!-- Warning icon -->
    <h1>Payment Not Finalized or Verified</h1>
    <p>Your payment is still being processed or hasn't been verified yet. Please check back later.</p>
  </div>

</body>
</html>
`