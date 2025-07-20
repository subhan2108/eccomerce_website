from django.urls import path, include
from . import views
from .views import register_user, create_order, OrderViewSet, admin_all_orders #update_order_status
from .views import product_reviews, review_detail,current_user
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
    path('admin/orders', admin_all_orders, name= 'admin_order'),
#    path('orders/<int:pk>/status/', update_order_status, name='update_order_status'),
    path('user-orders/', views.user_orders, name='user-orders'),
    path('invoice/<int:order_id>/', views.download_invoice, name='download-invoice'),
    path('profile/', views.user_profile, name='user-profile'),
    path('products/<int:product_id>/reviews/',views.product_reviews, name='product_reviews'),
    path('reviews/<int:review_id>/', review_detail),
    path('user/', current_user),


]

