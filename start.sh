#!/bin/bash
echo 'Starting apps:\nServer port: 3000\nClient port: 5137'
npm run dev --prefix server >> server.log 2>&1 &
npm run dev --prefix client &
wait
