### Steps to run the project
1. Clone this repo
2. cd rabbitmq-reliability
3. cp .env.example .env
4. Change ports and RabbitMQ connection url if needed
5. npm i
6. npm run alo:pub
7. npm run alo:sub
8. Make a get request to /alo/publish
9. Now you can observe the behavior from RabbitMQ management dashboard