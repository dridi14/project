from django.core.management.base import BaseCommand
from paho.mqtt import client as mqtt_client
import paho.mqtt.client as mqtt
from main.models import Sensor, SensorData, Room, AutomationRule
import os
import json

broker = 'mqtt.arcplex.fr'
port = 2295
topic = "groupe1/packet/#" 
mqtt_username = os.environ['MQTT_USERNAME']
mqtt_password = os.environ['MQTT_PASSWORD']

SENSOR_TYPE_BY_ID = {
    "115": "Movement",
    "136": "ADC",
    "112": "Temperature",
    "114": "Humidity",
    "116": "Atmospheric Pressure",
    "118": "Luminosity",
    "119": "Sound",
    "128": "Voltage",
    "131": "CO2",
    "100": "Passage",
    "101": "Heater",
    "102": "AC",
    "103": "Vent",
    "104": "Light",
}

def connect_mqtt():
    client = mqtt_client.Client()
    client.username_pw_set(mqtt_username, mqtt_password)
    client.on_connect = on_connect
    client.on_message = on_message
    client.connect(broker, port)
    return client

def on_connect(client, userdata, flags, rc):
    print(f"Connected with result code {rc}")
    client.subscribe(topic)
    # print(f"Subscribed to {topic}")


def on_message(client, userdata, msg):
    data = msg.payload.decode()
    data_json = json.loads(data) 

    # Extract room from the MQTT topic
    room_name = msg.topic.split('/')[2] 

    room, _ = Room.objects.get_or_create(name=room_name)

    # Extract fields from your MQTT message
    sensor_id = data_json.get('sensor_id')
    sink_id = data_json.get('sink_id')
    tx_time_ms_epoch = data_json.get('tx_time_ms_epoch')
    sensor_data = data_json.get('data')
    event_id = data_json.get('event_id')
    sensor_type = SENSOR_TYPE_BY_ID.get(str(sensor_id))
    source_address = msg.topic.split('/')[3]


    sensor, _ = Sensor.objects.get_or_create(sensor_id=sensor_id, sensor_type=sensor_type, room=room, source_address=source_address)

    # Create a SensorData instance
    instance = SensorData(sensor=sensor, is_active=True, sink_id=sink_id,
                          tx_time_ms_epoch=tx_time_ms_epoch, data=sensor_data, event_id=event_id)
    instance.save()
    # print(f"Data saved: {data}")

    # Check if any automation rules are triggered
    rules = AutomationRule.objects.filter(sensor=sensor)
    data_value = data_json.get('data')
    for rule in rules:
        condition_str = f'{data_value} {rule.condition}'
        if rule.sensor.sensor_id == sensor_id:
          if eval(condition_str):
              if not rule.state:
                  command_to_send = {
                      "cmd_id": random.randint(1, 1000),
                      "destination_address": source_address,
                      "ack_flags": 0,
                      "cmd_type": rule.command
                  }
                  
                  topic_to_send = f"groupe1/{request}/{room_name}"
                  client.publish(topic_to_send, json.dumps(command_to_send))
                  
                  rule.state = True
                  rule.save()
          else:
              rule.state = False
              rule.save()

class Command(BaseCommand):
    help = 'Run the MQTT client'

    def handle(self, *args, **options):
        client = connect_mqtt()
        client.loop_forever()
