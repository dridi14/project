from django.urls import path, include
from django.contrib import admin
from . import views
from .views import (RoomListCreate, RoomRetrieveUpdateDestroy, SensorListCreate, 
                    SensorRetrieveUpdateDestroy, SensorDataListCreate, SensorDataRetrieveUpdateDestroy, 
                    CreateUserView, SensorDataView, RoomSensorsView, RoomSensorDataView, CommandRoomView, AutomationRuleAPI)
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)

urlpatterns = [
    path('accounts/register/', CreateUserView.as_view(), name='create_user'),
    path('accounts/login/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('accounts/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('rooms/', RoomListCreate.as_view()),
    path('rooms/<int:pk>/', RoomRetrieveUpdateDestroy.as_view()),
    path('sensors/', SensorListCreate.as_view()),
    path('sensors/<int:pk>/', SensorRetrieveUpdateDestroy.as_view()),
    path('sensordata/', SensorDataListCreate.as_view()),
    path('sensordata/<int:pk>/', SensorDataRetrieveUpdateDestroy.as_view()),
    path('sensor_data/<str:sensor_id>/', SensorDataView.as_view()),
    path('room/<int:room_id>/sensors/', RoomSensorsView.as_view(), name='room-sensors'),
    path('room/<int:room_id>/sensor/<str:sensor_id>/data/<str:id>', RoomSensorDataView.as_view(), name='room-sensor-data'),
    path('room/<int:room_id>/command/', CommandRoomView.as_view(), name='room-command'),
    path('automation/', AutomationRuleAPI.as_view(), name='automation_rule_api'),
    path('automation/<int:rule_id>/', AutomationRuleAPI.as_view())
]