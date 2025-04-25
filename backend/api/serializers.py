from rest_framework import serializers
from .models import Category, SubCategory, Item

class ItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = Item
        fields = '__all__'

class SubCategorySerializer(serializers.ModelSerializer):
    items = ItemSerializer(many=True, read_only=True)

    class Meta:
        model = SubCategory
        fields = ['id', 'name', 'items']

class CategorySerializer(serializers.ModelSerializer):
    subCategory = SubCategorySerializer(many=True, read_only=True)

    class Meta:
        model = Category
        fields = ['id', 'name', 'subCategory']
