"use client";
import { useEffect, useState } from "react";
import ItemCard from "../components/ItemCard";
import ViewItem from "../components/ViewItem";
import LoadingScreen from "../components/LoadingScreen";
import { URL } from "../constants/constants";

export default function MenuSection() {
  const [items, setItems] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState();
  const [selectedSubCategory, setSelectedSubCategory] = useState();
  const [selectedItem, setSelectedItem] = useState(null);

  // fetch the menu items from the backend
  useEffect(() => {
    fetch(`${URL}api/menu/`)
      .then((res) => res.json())
      .then((data) => {
        setItems(data.items);
        // set the selected category and subcategory to the first item in the list
        if (data.items.length > 0) {
          setSelectedCategory(data.items[0].name);
          if (data.items[0].subCategory.length > 0) {
            setSelectedSubCategory(data.items[0].subCategory[0].name);
          }
        }
      })
      .catch((error) => {
        console.error("Error fetching menu items:", error);
        setItems([]);
      });
  }, []);

  // set the sub category when the category is changed
  useEffect(() => {
    if (!items) return;

    const current = items?.find((cat) => cat.name === selectedCategory);
    if (current && current.subCategory.length > 0) {
      setSelectedSubCategory(current.subCategory[0].name);
    }
  }, [selectedCategory]);

  // hide the body scroll when the item is selected
  useEffect(() => {
    selectedItem
      ? document.body.classList.add("overflow-hidden")
      : document.body.classList.remove("overflow-hidden");
  }, [selectedItem]);

  if (!items) return <LoadingScreen />;

  return (
    <section className="bg-[#fef5e5] text-[#bc7a2e]">
      <div className="menu mt-12 shadow-md fixed w-full z-10 bg-[#fef5e5]">
        <div className="category flex justify-center gap-5">
          {/* display the category of items */}
          {items?.map((item, index) => (
            <span
              key={index}
              className={`${
                selectedCategory == item?.name && "font-semibold"
              } hover:cursor-pointer`}
              onClick={() => setSelectedCategory(item?.name)}
            >
              {item?.name}
            </span>
          ))}
        </div>
        <div className="overflow-x-auto whitespace-nowrap px-4 py-2 xl:max-w-7xl xl:mx-auto md:text-center">
          <div className="inline-flex gap-6">
            {/* display the sub category of items */}
            {items
              .find((cat) => cat.name === selectedCategory)
              ?.subCategory?.map((item, index) => (
                <span
                  key={index}
                  className={`${
                    selectedSubCategory == item.name && "font-semibold"
                  } hover:cursor-pointer`}
                  onClick={() => setSelectedSubCategory(item.name)}
                >
                  {item.name}
                </span>
              ))}
          </div>
        </div>
      </div>
      <div className="px-6 md:px-10 lg-16 py-10">
        <div className="max-w-3xl mx-auto text-center space-y-3 mt-26">
          <h2 className="text-[20px] lg:text-[30px] xl:text-[40px] font-bold mb-4">
            {selectedSubCategory}
          </h2>
          <p className="font-semibold text-[15px] lg:text-[17px] xl:text-[19px] leading-relaxed px-4 md:px-0 xl:mt-3">
            all our breakfasts are served till 6 pm
          </p>
          <p className="text-[15px] lg:text-[17px]">
            morbi eu blandit urna. nam id luctus purus. praesent euismod felis
            id quam iaculis, id condimentum lacus maximus.
          </p>
        </div>

        <div className="space-y-6 max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2 md:gap-6 mt-5">
          {/* display the items */}
          {items
            .find((cat) => cat.name === selectedCategory)
            ?.subCategory.find((sub) => sub.name === selectedSubCategory)
            ?.items.map((item, index) => (
              <ItemCard
                key={index}
                item={item}
                setSelectedItem={setSelectedItem}
              />
            ))}
        </div>

        {/*  Popup or display the selected item */}
        {selectedItem && (
          <ViewItem
            selectedItem={selectedItem}
            setSelectedItem={setSelectedItem}
          ></ViewItem>
        )}
      </div>
    </section>
  );
}
