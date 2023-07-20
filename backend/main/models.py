from django.db import models

class Room(models.Model):
    name = models.CharField(max_length=255)

SENSOR_TYPE_BY_ID = {
    '115': 'Movement',
    '136': 'ADC',
    '112': 'Temperature',
    '114': 'Humidity',
    '116': 'Atmospheric Pressure',
    '118': 'Luminosity',
    '119': 'Sound',
    '128': 'Voltage',
    '131': 'CO2',
    '100': 'Passage',
    '101': 'Heater',
    '102': 'AC',
    '103': 'Vent',
    '104': 'Light'
}

class Sensor(models.Model):
    sensor_id = models.CharField(max_length=10, null=True)
    sensor_type = models.CharField(max_length=200, choices=SENSOR_TYPE_BY_ID.items(), null=True)
    source_address = models.UUIDField()
    room = models.ForeignKey(Room, on_delete=models.CASCADE, null=True)


class SensorData(models.Model):
    sensor = models.ForeignKey(Sensor, on_delete=models.CASCADE)
    is_active = models.BooleanField(default=True)
    sink_id = models.CharField(max_length=50, null=True, blank=True) 
    tx_time_ms_epoch = models.BigIntegerField()
    data = models.JSONField()  # JSON 
    event_id = models.IntegerField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

class AutomationRule(models.Model):
    sensor = models.ForeignKey(Sensor, on_delete=models.CASCADE)
    condition = models.CharField(max_length=255)
    command = models.CharField(max_length=255)
    state = models.BooleanField(default=False)