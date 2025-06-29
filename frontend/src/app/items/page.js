"use client";
import { useEffect, useState } from "react";
import { useMenuData, useCategories, useSubCategories, useItems } from "../hooks/useMenuData";
import ItemCard from "../components/ItemCard";
import ViewItem from "../components/ViewItem";
import LoadingScreen from "../components/LoadingScreen";

export default function MenuSection() {
    const { categories, loading: categoriesLoading, error: categoriesError } = useCategories();
    const [selectedCategoryId, setSelectedCategoryId] = useState(null);
    const [selectedSubCategoryId, setSelectedSubCategoryId] = useState(null);
    const [selectedItem, setSelectedItem] = useState(null);
    
    const { subcategories, loading: subcategoriesLoading } = useSubCategories(selectedCategoryId);
    const { items, loading: itemsLoading } = useItems(selectedSubCategoryId, selectedCategoryId);

    useEffect(() => {
        if (categories.length > 0 && !selectedCategoryId) {
            setSelectedCategoryId(categories[0].id);
        }
    }, [categories, selectedCategoryId]);

    useEffect(() => {
        if (subcategories.length > 0 && selectedCategoryId) {
            setSelectedSubCategoryId(subcategories[0].id);
        }
    }, [subcategories, selectedCategoryId]);

    useEffect(() => {
        if (selectedItem) {
            document.body.classList.add("overflow-hidden");
        } else {
            document.body.classList.remove("overflow-hidden");
        }

        return () => {
            document.body.classList.remove("overflow-hidden");
        };
    }, [selectedItem]);

    const selectedCategory = categories.find(cat => cat.id === selectedCategoryId);
    const selectedSubCategory = subcategories.find(sub => sub.id === selectedSubCategoryId);

    if (categoriesLoading) {
        return <LoadingScreen />;
    }

    if (categoriesError) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#fef5e5] text-[#bc7a2e]">
                <div className="text-center">
                    <h2 className="text-2xl font-bold mb-4">Unable to load menu</h2>
                    <p className="text-lg">{categoriesError}</p>
                    <button 
                        onClick={() => window.location.reload()} 
                        className="mt-4 px-6 py-2 bg-[#bc7a2e] text-white rounded hover:bg-[#a66825]"
                    >
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    return (
        <section className="bg-[#fef5e5] text-[#bc7a2e]">
            <div className="menu mt-12 shadow-md fixed w-full z-10 bg-[#fef5e5]">
                <div className="category flex justify-center gap-5">
                    {categories.map((category) => (
                        <button
                            key={category.id}
                            className={`px-3 py-2 capitalize hover:font-semibold transition-all ${
                                selectedCategoryId === category.id ? "font-semibold" : ""
                            }`}
                            onClick={() => setSelectedCategoryId(category.id)}
                        >
                            {category.name}
                        </button>
                    ))}
                </div>
                
                {subcategoriesLoading ? (
                    <div className="flex justify-center py-4">
                        <div className="animate-spin h-5 w-5 border-2 border-[#bc7a2e] border-t-transparent rounded-full"></div>
                    </div>
                ) : (
                    <div className="overflow-x-auto whitespace-nowrap px-4 py-2 xl:max-w-7xl xl:mx-auto md:text-center">
                        <div className="inline-flex gap-6">
                            {subcategories.map((subcategory) => (
                                <button
                                    key={subcategory.id}
                                    className={`capitalize hover:font-semibold transition-all ${
                                        selectedSubCategoryId === subcategory.id ? "font-semibold" : ""
                                    }`}
                                    onClick={() => setSelectedSubCategoryId(subcategory.id)}
                                >
                                    {subcategory.name}
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            <div className="px-6 md:px-10 lg-16 py-10">
                <div className="max-w-3xl mx-auto text-center space-y-3 mt-26">
                    <h2 className="text-[20px] lg:text-[30px] xl:text-[40px] font-bold mb-4 capitalize">
                        {selectedSubCategory ? selectedSubCategory.name : selectedCategory?.name || "Menu"}
                    </h2>
                    {selectedSubCategory?.description && (
                        <p className="font-semibold text-[15px] lg:text-[17px] xl:text-[19px] leading-relaxed px-4 md:px-0 xl:mt-3">
                            {selectedSubCategory.description}
                        </p>
                    )}
                    {selectedCategory?.description && (
                        <p className="text-[15px] lg:text-[17px]">
                            {selectedCategory.description}
                        </p>
                    )}
                </div>

                {itemsLoading ? (
                    <div className="flex justify-center items-center py-20">
                        <div className="text-center">
                            <div className="animate-spin h-8 w-8 border-3 border-[#bc7a2e] border-t-transparent rounded-full mx-auto mb-4"></div>
                            <p className="text-lg">Loading items...</p>
                        </div>
                    </div>
                ) : items.length === 0 ? (
                    <div className="text-center py-20">
                        <p className="text-lg text-[#5c4a2b]">No items available in this category</p>
                    </div>
                ) : (
                    <div className="space-y-6 max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2 md:gap-6 mt-5">
                        {items.map((item) => (
                            <ItemCard 
                                key={item.id} 
                                item={item} 
                                setSelectedItem={setSelectedItem}
                            />
                        ))}
                    </div>
                )}

                {selectedItem && (
                    <ViewItem 
                        selectedItem={selectedItem} 
                        setSelectedItem={setSelectedItem}
                    />
                )}
            </div>
        </section>
    );
  }
