#!/usr/bin/bash

echo ' '
echo 'User requstration:'
echo ' '

http POST 0.0.0.0:8081/user/register username=Igor
# {
#     "id": 3230593,
#     "username": "Igor"
# }

echo ' '
echo 'User requstration:'
echo ' '

http POST 0.0.0.0:8081/messages user_id=3230593 message='Hello! everyone!' datetime="2017-03-16T23:33:35.274Z"

# true