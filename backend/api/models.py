from django.db import models

class Category(models.Model):
    name = models.CharField(max_length=100, unique=True)
    description = models.TextField(blank=True)

    def __str__(self):
        return self.name

class SubCategory(models.Model):
    category = models.ForeignKey(Category, on_delete=models.CASCADE, related_name='subCategory')
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True)


    def __str__(self):
        return self.name

class Item(models.Model):
    subcategory = models.ForeignKey(SubCategory, on_delete=models.CASCADE, related_name='items')
    name = models.CharField(max_length=150)
    description = models.TextField(blank=True)
    price = models.IntegerField()
    image = models.ImageField(upload_to='items/', blank=True, null=True)  # Optional image

    def __str__(self):
        return self.name
