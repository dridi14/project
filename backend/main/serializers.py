from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Room, Sensor, SensorData, AutomationRule

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'password']
        extra_kwargs = {
            'password': {'write_only': True}
        }

    def create(self, validated_data):
        username = validated_data['username']
        email = validated_data['email']
        password = validated_data['password']
        user = User.objects.create_user(
            username=username,
            email=email,
            password=password
        )
        return user

class RoomSerializer(serializers.ModelSerializer):
    class Meta:
        model = Room
        fields = ['id', 'name']  # Add more fields as per your requirements.

class SensorSerializer(serializers.ModelSerializer):
    room = RoomSerializer()

    class Meta:
        model = Sensor
        fields = ['id', 'sensor_id', 'sensor_type', 'source_address', 'room']

class SensorDataSerializer(serializers.ModelSerializer):
    sensor = SensorSerializer()

    class Meta:
        model = SensorData
        fields = ['id', 'is_active', 'sensor', 'sink_id', 'tx_time_ms_epoch', 'data', 'event_id']
       
    def create(self, validated_data):
      return SensorData.objects.create(**validated_data)

class Sensor_dataSerializer(serializers.ModelSerializer):
    class Meta:
        model = SensorData
        fields = '__all__'

class AutomationRuleSerializer(serializers.ModelSerializer):
    sensor = SensorSerializer()
    
    class Meta:
        model = AutomationRule
        fields = ['id', 'sensor', 'condition', 'command', 'state']