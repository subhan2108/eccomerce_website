from django.shortcuts import render
import razorpay
from django.views.decorators.csrf import csrf_exempt
from django.conf import settings
# Create your views here.
from rest_framework.decorators import api_view,permission_classes
from rest_framework.response import Response
from rest_framework .permissions import IsAuthenticated
from .models import Product, Order, OrderItem, ShippingAddress, Review
from .serializers import ProductSerializer, OrderSerializer, ReviewSerializer
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework import status
from django.contrib.auth.models import User
from .serializers import OrderSerializer
from rest_framework import viewsets
from rest_framework.permissions import IsAdminUser
from django.http import FileResponse
from reportlab.pdfgen import canvas
from django.http import HttpResponse
from django.shortcuts import get_object_or_404
from .utils.email import send_order_email
import json
import hmac
import hashlib
from django.http import JsonResponse


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


@api_view(['GET'])
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
    user = request.user
    data = request.data

    shipping = data.get('shipping')
    items = data.get('items')  # list of {product, quantity, price}

    if not items or not shipping:
        return Response({'error': 'Missing fields'}, status=400)

    try:
        order = Order.objects.create(
            user=user,
            
            status='success'  # 🔁 Set status as success immediately
        )

        for item in items:
            product = Product.objects.get(id=item['product'])
            OrderItem.objects.create(
                order=order,
                product=product,
                quantity=item['quantity'],
                price=item['price']
            )

        return Response({'message': 'Order created'}, status=201)

    except Exception as e:
        return Response({'error': str(e)}, status=500)



class OrderViewSet(viewsets.ModelViewSet):
    queryset = Order.objects.all()
    serializer_class = OrderSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
        
        
#@api_view(['PATCH'])
#@permission_classes([IsAdminUser])
#def update_order_status(request, pk):
#    try:
#        order = Order.objects.get(pk=pk)
#    except Order.DoesNotExist:
#        return Response({'error': 'Order not found'}, status=status.HTTP_404_NOT_FOUND)

#    new_status = request.data.get('status')
#    if not new_status:
#        return Response({'error': 'Status is required'}, status=400)

#    order.status = new_status
#    order.save()
#    serializer = OrderSerializer(order)
#    return Response(serializer.data)

    
    
@api_view(['GET'])
@permission_classes([IsAdminUser])
def admin_all_orders(request):
    orders = Order.objects.all()
    serializer = OrderSerializer(orders, many=True)
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def user_orders(request):
    user = request.user
    orders = Order.objects.filter(user=user).order_by('-created_at')
    serializer = OrderSerializer(orders, many=True)
    return Response(serializer.data)




@api_view(['GET'])
@permission_classes([IsAuthenticated])
def download_invoice(request, order_id):
    try:
        order = Order.objects.get(id=order_id, user=request.user)
    except Order.DoesNotExist:
        return HttpResponse("Order not found", status=404)

    response = HttpResponse(content_type='application/pdf')
    response['Content-Disposition'] = f'attachment; filename="invoice_{order_id}.pdf"'

    p = canvas.Canvas(response)
    p.setFont("Helvetica", 12)

    # Sample invoice content
    p.drawString(100, 800, f"Invoice for Order #{order.id}")
    p.drawString(100, 780, f"User: {request.user.username}")
    p.drawString(100, 760, f"Total Price: ₹{order.total_price}")
    p.drawString(100, 740, f"Status: {order.status}")
    p.drawString(100, 720, "Thank you for shopping with us!")

    p.showPage()
    p.save()
    return response



@api_view(['GET'])
@permission_classes([IsAuthenticated])
def user_profile(request):
    user = request.user
    return Response({
        'username': user.username,
        'email': user.email
    })


# Example (Django viewset or function view)
@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def product_reviews(request, product_id):
    if request.method == 'GET':
        reviews = Review.objects.filter(product__id=product_id).order_by('-created_at')
        return Response(ReviewSerializer(reviews, many=True).data)

    if request.method == 'POST':
        data = request.data.copy()
        data['product'] = product_id
        serializer = ReviewSerializer(data=data)
        if serializer.is_valid():
            serializer.save(user=request.user)
            return Response(serializer.data, status=201)
        return Response(serializer.errors, status=400)


# NEW: Edit/Delete endpoints
@api_view(['PUT', 'DELETE'])
@permission_classes([IsAuthenticated])  # ✅ ensure only logged-in users can access
def review_detail(request, review_id):
    review = get_object_or_404(Review, id=review_id)

    # ✅ Verify current user owns the review
    if review.user != request.user:
        return Response({"error": "Not authorized to modify this review"}, status=403)

    if request.method == 'PUT':
        serializer = ReviewSerializer(review, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=400)

    elif request.method == 'DELETE':
        review.delete()
        return Response(status=204)

    
    

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_order(request):
    user = request.user
    data = request.data
    shipping = data.get('shipping')
    items = data.get('items')
    payment_id = data.get('payment_id')
    razorpay_order_id = data.get('razorpay_order_id')

    if not items or not shipping:
        return Response({'error': 'Missing items or shipping info'}, status=400)

    try:
        # Validate shipping fields
        required_fields = ['name', 'phone', 'address', 'city', 'state', 'zip', 'country']
        for field in required_fields:
            if field not in shipping:
                return Response({'error': f'Missing shipping field: {field}'}, status=400)

        # Create Order
        order = Order.objects.create(user=user, status='success')

        # Save Shipping Address
        ShippingAddress.objects.create(
            order=order,
            address=shipping['address'],
            city=shipping['city'],
            postal_code=shipping['zip'],
            country=shipping['country'],
            phone=shipping['phone']
        )

        # Save Order Items
        for item in items:
            product = Product.objects.get(id=item['product'])
            OrderItem.objects.create(
                order=order,
                product=product,
                quantity=item['quantity'],
                price=item['price']
            )

        # Send emails
        send_order_email(
            subject='🛒 Order Placed Successfully!',
            message=f'Thank you for your order #{order.id}.',
            to_email=user.email
        )

        return Response({'message': 'Order created'}, status=201)

    except Exception as e:
        return Response({'error': str(e)}, status=500)



@api_view(['GET'])
@permission_classes([IsAuthenticated])
def current_user(request):
    return Response({
        'username': request.user.username,
        'email': request.user.email,
    })


@api_view(['POST'])
def create_razorpay_order(request):
    client = razorpay.Client(auth=(settings.RAZORPAY_KEY_ID, settings.RAZORPAY_KEY_SECRET))
    amount = request.data.get('amount') * 100  # convert to paise

    data = {
        "amount": int(amount),
        "currency": "INR",
        "payment_capture": 1
    }

    razorpay_order = client.order.create(data=data)
    return Response({
        "order_id": razorpay_order['id'],
        "key": settings.RAZORPAY_KEY_ID,
        "amount": amount
    })

@csrf_exempt
@api_view(['POST'])
def verify_payment(request):
    data = request.data
    try:
        client = razorpay.Client(auth=(settings.RAZORPAY_KEY_ID, settings.RAZORPAY_KEY_SECRET))
        params_dict = {
            'razorpay_order_id': data['razorpay_order_id'],
            'razorpay_payment_id': data['razorpay_payment_id'],
            'razorpay_signature': data['razorpay_signature']
        }

        client.utility.verify_payment_signature(params_dict)

        # ✅ If no exception, it's a valid payment
        # You can now mark order as paid in DB
        return Response({"status": "success"})
    except razorpay.errors.SignatureVerificationError:
        return Response({"status": "failure"}, status=400)



@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_razorpay_order(request):
    try:
        amount = request.data.get('amount')
        if not amount:
            return JsonResponse({'error': 'Amount is required'}, status=400)

        client = razorpay.Client(auth=(settings.RAZORPAY_KEY_ID, settings.RAZORPAY_KEY_SECRET))

        razorpay_order = client.order.create({
            "amount": int(amount),  # Amount in paise
            "currency": "INR",
            "payment_capture": 1
        })

        return JsonResponse(razorpay_order, safe=False)

    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)
