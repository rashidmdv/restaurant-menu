import Image from "next/image";

export default function ViewItem({selectedItem,setSelectedItem}) {
    return (
        <div className="fixed top-[140px] inset-0 bg-opacity-60 flex justify-center items-center z-20 backdrop-blur-md bg-black/30 bg-opacity-100">
            <div className="bg-[#fff5e5] max-w-md text-center fixed bottom-0 md:bottom-[30%] lg:bottom-[0%] xl:bottom-[10%] 2xl:bottom-[25%]">
                {/* close icon of item */}
                <button
                    className="absolute top-4 right-4 text-[#a86a30] text-5xl font-normal hover:cursor-pointer"
                    onClick={() => setSelectedItem(null)}
                >
                    &times;
                </button>
                <Image
                    src={selectedItem.image}
                    alt={selectedItem.title}
                    className="w-[250px] h-[250px] object-cover rounded-full hover:rounded-none transition-all duration-300 cursor-pointer mx-auto mb-4 mt-10"
                    width={250}
                    height={250}
                />
                <div className="px-10 mb-10">
                    <p className="text-lg font-semibold text-[#a86a30] mt-7">
                        {selectedItem.title}{" "}
                        <span className="font-normal">
                            {selectedItem.price} {selectedItem.dietary}
                        </span>
                    </p>
                    <p className="text-[#a86a30] mt-2 mb-2 text-center">{selectedItem.desc}</p>
                </div>
            </div>
        </div>
    )
}