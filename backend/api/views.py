# from django.shortcuts import render
# from django.http import JsonResponse
from . import models
from .serializers import ItemSerializer,CategorySerializer,SubCategorySerializer

# def sample_api(request):
#     items = models.Item.objects.all().values()
#     return JsonResponse({'items': list(items)})


from rest_framework.decorators import api_view
from rest_framework.response import Response

# @api_view(['GET'])
# def api(request):
#     items = models.Item.objects.all().values()
#     return Response({"message": items})

# @api_view(['GET'])
# def api(request):
#     queryset = models.Item.objects.all()
#     serializer = ItemSerializer(queryset, many=True)
#     return Response(serializer.data)

@api_view(['GET'])
def api(request):
    # queryset = models.Category.objects.all()
    # serializer = CategorySerializer(queryset, many=True)
    # return Response(serializer.data)

    categories = models.Category.objects.all()
    subcategories = models.SubCategory.objects.all()
    items = models.Item.objects.all()

    return Response({
        "items": CategorySerializer(categories, many=True).data,
    })


    # items = models.Item.objects.all()
    # data = []
    # for item in items:
    #     data = {
    #         "id": item.subcategory.category.id,
    #         "name": item.subcategory.category.name,
    #         "subcategories": [
    #         {
    #             "id": item.subcategory.id,
    #             "name": item.subcategory.name,
    #             "items": [
    #             { "id": item.id, "name": item.name, "description": item.description, "price": item.price, "image": item.image.url }
    #             ]
    #         }
    #         ]
    #     }

    #     print(data)
    # return Response({"message": data})