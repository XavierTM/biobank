
# API Design

### Create account
**POST** `/api/user`
**expects**:
```
body: {
   name: string,
   surname: string,
   national_id: string
}
```

**returns**: 
```
body: {
   account_secret: string,
   email: string,
   password: string,
}
```

### Login
**POST** `/api/users/login`
**expects**:
```
body: {
   account_secret: string
}
```

### Logout
**DELETE** `/api/users/login`


### Create merchant
**POST** `/api/users/{id}/merchants`
**expects**:
```
body: {
   name: string
}
```

### Approve transaction
**POST** `/api/transactions/{trxn_id}/approve`
**expects**:
```
body: {
   account_secret: string
}
```

### View dashboard
**GET** `/api/users/{id}`
**returns**:
```
body: {
   name: string,
   surname: string,
   account_number: string,
   balance: float,
   merchants: [
      {
         transactions: integer,
         name: string
      },
      ...
   ]
}
```


### Deposit money
**POST** `/api/users/{user_id}/deposits`
**expects**:
```
body: {
   amount: float
}
```


### Request payment
**POST** `/api/transactions`
**expects**:
```
body: {
   amount: float,
   merchant_id: int,
   from: string
}
```