import amqplib, { Channel, Connection, ConsumeMessage } from "amqplib";

let connection: Connection;
let channel: Channel;

export async function connectRabbitMQ(){
    try{
        const connectionString = process.env.RABRITMQ_CONNECTION_STRING || "amqp://localhost:5672";

        connection = await amqplib.connect(connectionString);

        //set up dead letter queue
        let dlChannel = await connection.createChannel();
        await dlChannel.assertExchange('logging.dlx', 'direct', {
            durable: true,
            autoDelete: false,
            internal: false
        });

        await dlChannel.assertQueue("logger.dlq", {
            autoDelete: false,
            durable: true,
            exclusive: false
        });

        await dlChannel.bindQueue("logger.dlq", "logging.dlx", "dead.logger");

        //set up publisher queue
        channel = await connection.createChannel();
        await channel.assertExchange('logging', 'topic', {
            durable: true,
            autoDelete: false,
            internal: false
        });

        await channel.assertQueue("logs.ping", {
            autoDelete: false,
            durable: true,
            exclusive: false,
            deadLetterExchange: "logging.dlx",
            deadLetterRoutingKey: "dead.logger"
        });

        await channel.assertQueue("logs.error", {
            autoDelete: false,
            durable: true,
            exclusive: false,
            deadLetterExchange: "logging.dlx",
            deadLetterRoutingKey: "dead.logger"
        });

        await channel.bindQueue("logs.ping", "logging", "logs.ping");
        await channel.bindQueue("logs.error", "logging", "logs.error");

        console.log("RABBITMQ Connected")
    }catch(e){ console.log(e)
        throw(e);
    }
}

export async function startConsumer() {
    await channel.consume('logs.ping', (msg) => {
        console.log(msg?.content.toString())
        channel.nack(msg as ConsumeMessage, true, false);
    }, {
        noAck: false
    });
}