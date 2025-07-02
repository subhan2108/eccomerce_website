from django.contrib import admin
from.models import OrderItem,Order,Product,Payment, ShippingAddress
# Register your models here.
from django.contrib.admin import AdminSite

admin.site.register(Order)
admin.site.register(Payment)
admin.site.register(Product)
admin.site.register(OrderItem)
admin.site.register(ShippingAddress)