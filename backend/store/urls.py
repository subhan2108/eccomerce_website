from django.urls import path, include
from . import views
from .views import register_user, create_order, OrderViewSet
from rest_framework.routers import DefaultRouter

router = DefaultRouter()
router.register(r'orders', OrderViewSet, basename='order')

urlpatterns = [
    path('products/', views.product_list),
    path('products/<int:pk>/', views.product_detail),
    path('register/', register_user, name='register'),
    path('create-order/', create_order, name='create_order'),  # ✅ changed path
    path('order-list/', views.order_list),  # ✅ renamed to avoid conflict
    path('api/', include(router.urls)),  # contains /api/orders/
]

