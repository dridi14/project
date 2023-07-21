from .constants import COMMANDS
from django.utils import timezone
from .models import Room, Sensor, SensorData, AutomationRule
from .serializers import RoomSerializer, SensorSerializer, SensorDataSerializer, Sensor_dataSerializer, AutomationRuleSerializer
from .serializers import UserSerializer
from django.contrib.auth.decorators import login_required
from django.contrib.auth.forms import UserCreationForm
from django.db.models import Count
from django.db.models.functions import TruncDay
from django.shortcuts import render, redirect, get_object_or_404
from paho.mqtt import client as mqtt_client
from rest_framework import generics
from rest_framework import status
from rest_framework.exceptions import NotFound
from rest_framework.response import Response
from rest_framework.views import APIView
import json
import os
import random


class CreateUserView(APIView):
    def post(self, request):
        serializer = UserSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            return Response({'message': 'User created successfully'}, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class RoomListCreate(generics.ListCreateAPIView):
    queryset = Room.objects.all()
    serializer_class = RoomSerializer

class RoomRetrieveUpdateDestroy(generics.RetrieveUpdateDestroyAPIView):
    queryset = Room.objects.all()
    serializer_class = RoomSerializer

class SensorListCreate(generics.ListCreateAPIView):
    queryset = Sensor.objects.all()
    serializer_class = SensorSerializer

class SensorRetrieveUpdateDestroy(generics.RetrieveUpdateDestroyAPIView):
    queryset = Sensor.objects.all()
    serializer_class = SensorSerializer

class SensorDataListCreate(generics.ListCreateAPIView):
    queryset = SensorData.objects.all()
    serializer_class = SensorDataSerializer

class SensorDataRetrieveUpdateDestroy(generics.RetrieveUpdateDestroyAPIView):
    queryset = SensorData.objects.all()
    serializer_class = SensorDataSerializer

class SensorDataView(APIView):
    """
    get list all sensor data in a sensor.
    """
    def get(self, request, sensor_id):
        sensor_data = SensorData.objects.filter(sensor__sensor_id=sensor_id).order_by('-id')[:50]
        serializer = Sensor_dataSerializer(sensor_data, many=True)
        return Response(serializer.data)

class RoomSensorsView(APIView):
    """
    get list all sensors in a room.
    """
    def get(self, request, room_id):
        room = get_object_or_404(Room, id=room_id)
        sensors = room.sensor_set.all()
        serializer = SensorSerializer(sensors, many=True)
        return Response(serializer.data)

class RoomSensorDataView(APIView):
    """
    Get a list of all data of a sensor in a room based on the interval.
    """
    def get(self, request, room_id, sensor_id, id):
        interval = request.query_params.get('interval', None)
        room = get_object_or_404(Room, id=room_id)
        sensor = get_object_or_404(Sensor, sensor_id=sensor_id, room=room, id=id)

        if interval is None or interval == '':
            sensor_data = sensor.sensordata_set.all().order_by('-created_at')[:50]
        elif interval == 'hour':
            sensor_data = sensor.sensordata_set.all().order_by('-created_at')[:20]
        elif interval == 'day':
            end_date = timezone.now()
            start_date = end_date - timezone.timedelta(days=1)
            sensor_data = sensor.sensordata_set.filter(created_at__range=(start_date, end_date)).order_by('created_at')
            data_count = sensor_data.count()
            interval = data_count // 10 if data_count > 10 else 1
            sensor_data = sensor_data[::interval][:10]
        else:
            data_per_day = sensor.sensordata_set.annotate(day=TruncDay('created_at')).values('day').annotate(c=Count('id')).values('day', 'c')

            sensor_data = []
            for data in data_per_day:
                day_data = sensor.sensordata_set.filter(created_at__date=data['day']).order_by('created_at')
                
                data_count = day_data.count()
                interval = data_count // 10 if data_count > 10 else 1
                sensor_data.extend(day_data[::interval][:10])

        serializer = SensorDataSerializer(sensor_data, many=True)
        return Response(serializer.data)

class CommandRoomView(APIView):
    """
    post a command to a room.
    """
    def post(self, request, room_id, format=None):
        room = get_object_or_404(Room, pk=room_id)
        gateway_id = room.name
        group = 'groupe1'
        cmd_type = int(request.data.get('command'))
        sensor_id = request.data.get('sensor_id')
        sensor = get_object_or_404(Sensor, room=room, sensor_id=sensor_id)
        source = str(sensor.source_address)
        if not cmd_type:
            return Response({"error": f"Invalid command.{cmd_type}"}, status=400)

        command_dict = {
            "cmd_id": random.randint(1, 10000), 
            "destination_address": source,
            "ack_flags": 0,
            "cmd_type": cmd_type
        }

        mqtt_username = os.environ['MQTT_USERNAME']
        mqtt_password = os.environ['MQTT_PASSWORD']
        broker = 'mqtt.arcplex.fr'  
        port = 2295 

        def connect_mqtt() -> mqtt_client:
            def on_connect(client, userdata, flags, rc):
                if rc == 0:
                    print("Connected to MQTT Broker!")
                else:
                    print("Failed to connect, return code %d\n", rc)

            client = mqtt_client.Client()
            client.username_pw_set(mqtt_username, mqtt_password)
            client.on_connect = on_connect
            client.connect(broker, port)
            return client

        client = connect_mqtt()
        client.loop_start()

        mqtt_topic = f"{group}/request/{gateway_id}"
        result = client.publish(mqtt_topic, json.dumps(command_dict))

        if result[0] == 0:
            print(f"Command sent to topic {mqtt_topic}.")
            return Response({"message": f"Command sent to topic {mqtt_topic}."}, status=200)
        else:
            print(f"Failed to send command to topic {mqtt_topic}.")
            return Response({"message": f"Failed to send command to topic {mqtt_topic}."}, status=400)

class AutomationRuleAPI(APIView):
    """
    get list all automation rules.
    """
    def get(self, request, format=None):
        rules = AutomationRule.objects.all()
        serializer = AutomationRuleSerializer(rules, many=True)
        return Response(serializer.data)

    def post(self, request):
        room_id = request.data.get('room')
        sensor_id = request.data.get('sensor')
        command = request.data.get('command')
        condition = request.data.get('condition')

        try:
            sensor = Sensor.objects.get(sensor_id=sensor_id, room__id=room_id)
        except Sensor.DoesNotExist:
            raise NotFound("Sensor with the given id does not exist.")

        rule = AutomationRule.objects.create(
            sensor=sensor,
            command=command,
            condition=condition,
            state=False
        )

        return Response({"message": f"AutomationRule created with id: {rule.id}"}, status=201)
        
    def delete(self, request, rule_id):
        try:
            rule = AutomationRule.objects.get(id=rule_id)
        except AutomationRule.DoesNotExist:
            raise NotFound("AutomationRule with the given id does not exist.")

        rule.delete()

        return Response({"message": f"AutomationRule with id {rule_id} deleted."}, status=status.HTTP_204_NO_CONTENT)
