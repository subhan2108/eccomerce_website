from django.contrib import admin
from.models import OrderItem,Order,Product,Payment, ShippingAddress, Review
# Register your models here.
from django.contrib.admin import AdminSite
from django.contrib.auth.models import User

admin.site.register(Order)
admin.site.register(Payment)
admin.site.register(Product)
admin.site.register(Review)
admin.site.register(OrderItem)
admin.site.register(ShippingAddress)
admin = User.objects.get(username='subhan')
admin.is_staff = True
admin.save()
