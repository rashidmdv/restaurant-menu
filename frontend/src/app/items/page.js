"use client";
import { useEffect, useState } from "react";
import { category, menuItems } from "../constants/constants";
import ItemCard from "../components/ItemCard";
import ViewItem from "../components/ViewItem";

export default function MenuSection() {

    const [selectedCategory, setSelectedCategory] = useState(category[0].name);
    const [selectedSubCategory, setSelectedSubCategory] = useState(category[0].subCategory[0]);
    const [selectedItem, setSelectedItem] = useState(null);

    useEffect(() => {
        const current = category.find(cat => cat.name === selectedCategory);
        if (current && current.subCategory.length > 0) {
          setSelectedSubCategory(current.subCategory[0]);
        }
      }, [selectedCategory]);

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

    return (
      <section className="bg-[#fef5e5] text-[#bc7a2e]">
        <div className="menu mt-12 shadow-md fixed w-full z-10 bg-[#fef5e5]">
            <div className="category flex justify-center gap-5">
                {/* display the category of items */}
                {category.map((item, index) => (
                    <a href="#" key={index} className={`${selectedCategory == item.name && "font-semibold"}`} onClick={() => setSelectedCategory(item.name)}>{item.name}</a>
                ))}
            </div>
            <div className="overflow-x-auto whitespace-nowrap px-4 py-2 xl:max-w-7xl xl:mx-auto md:text-center">
                <div className="inline-flex gap-6">
                    {/* display the sub category of items */}
                    {category.find((item) => item.name == selectedCategory).subCategory.map((item, index) =>(
                        <a href="#" key={item} className={`${selectedSubCategory == item && "font-semibold"}`} onClick={() => setSelectedSubCategory(item) } >{item}</a>
                    ))}
                </div>
            </div>
        </div>
        <div className="px-6 md:px-10 lg-16 py-10">
            <div className="max-w-3xl mx-auto text-center space-y-3 mt-26">
                <h2 className="text-[20px] lg:text-[30px] xl:text-[40px] font-bold mb-4">breakfast</h2>
                <p className="font-semibold text-[15px] lg:text-[17px] xl:text-[19px] leading-relaxed px-4 md:px-0 xl:mt-3">all our breakfasts are served till 6pm</p>
                <p className="text-[15px] lg:text-[17px]">
                    morbi eu blandit urna. nam id luctus purus. praesent euismod felis id quam iaculis, id condimentum lacus maximus.
                </p>
            </div>

            <div className="space-y-6 max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2 md:gap-6 mt-5">

                {/* display the items */}
                {menuItems.map((item, index) => (
                    <ItemCard key={index} item={item} setSelectedItem={setSelectedItem}></ItemCard>
                ))}

            </div>

            {/*  Popup or display the selected item */}
            {selectedItem && (
                <ViewItem selectedItem={selectedItem} setSelectedItem={setSelectedItem}></ViewItem>
            )}
        </div>
      </section>
    );
  }
