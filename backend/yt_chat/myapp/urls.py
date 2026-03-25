
from django.urls import path, include
from .views import link, chat
urlpatterns = [
    path('link', link, name='link'),
    path('chat', chat, name='chat'),
]
