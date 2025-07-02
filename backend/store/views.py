from django.shortcuts import render

# Create your views here.
from rest_framework.decorators import api_view,permission_classes
from rest_framework.response import Response
from rest_framework .permissions import IsAuthenticated
from .models import Product, Order, OrderItem, ShippingAddress
from .serializers import ProductSerializer, OrderSerializer
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework import status
from django.contrib.auth.models import User
from .serializers import OrderSerializer
from rest_framework import viewsets

@api_view(['GET'])
def product_list(request):
    products = Product.objects.all()
    serializer = ProductSerializer(products, many=True)
    return Response(serializer.data)

@api_view(['GET'])
def order_list(request):
    orders = Order.objects.all()
    serializer = OrderSerializer(orders, many=True)
    return Response(serializer.data)


@api_view(['POST'])
def product_detail(request, pk):
    try:
        product = Product.objects.get(pk=pk)
        serializer = ProductSerializer(product)
        return Response(serializer.data)
    except Product.DoesNotExist:
        return Response({'error': 'Not found'}, status=404)

@api_view(['POST'])
def register_user(request):
    data = request.data
    username = data.get('username')
    email = data.get('email', '')
    password = data.get('password')

    if not username or not password:
        return Response({'error': 'Username and password are required'}, status=400)

    if User.objects.filter(username=username).exists():
        return Response({'error': 'Username already exists'}, status=400)

    try:
        user = User.objects.create_user(
            username=username,
            email=email,
            password=password
        )
        refresh = RefreshToken.for_user(user)
        return Response({
            'refresh': str(refresh),
            'access': str(refresh.access_token),
            'username': user.username
        }, status=status.HTTP_201_CREATED)
    except Exception as e:
        return Response({'error': 'Registration failed. Try again.'}, status=400)
    
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_order(request):
    print("📥 Received data:", request.data)

    user = request.user
    data = request.data

    print("📦 Incoming order data:", data)  # 🔍 print received data

    shipping = data.get('shipping')
    items = data.get('items')

    if not items or not shipping:
        print("❌ Missing items or shipping")
        return Response({'error': 'Missing fields'}, status=400)

    try:
        order = Order.objects.create(user=user, )
        print(f"✅ Created Order: {order.id}")

        for item in items:
            print("➡️ Item:", item)
            product = Product.objects.get(id=item['product'])
            OrderItem.objects.create(
                order=order,
                product=product,
                quantity=item['quantity'],
                price=item['price']
            )

        return Response({'message': 'Order created'}, status=201)

    except Exception as e:
        print("🔥 Error creating order:", str(e))  # ✅ log the real error
        return Response({'error': str(e)}, status=500)


class OrderViewSet(viewsets.ModelViewSet):
    queryset = Order.objects.all()
    serializer_class = OrderSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)