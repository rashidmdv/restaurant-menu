import Image from "next/image";

export default function ViewItem({ selectedItem, setSelectedItem }) {
    const formatPrice = (price, currency = 'AED') => {
        return `${currency} ${price?.toFixed(2) || '0.00'}`;
    };

    const formatDietaryInfo = (dietaryInfo) => {
        if (!dietaryInfo || typeof dietaryInfo !== 'object') return '';
        
        const info = [];
        if (dietaryInfo.vegetarian) info.push('Vegetarian');
        if (dietaryInfo.vegan) info.push('Vegan');
        if (dietaryInfo.gluten_free) info.push('Gluten Free');
        if (dietaryInfo.dairy_free) info.push('Dairy Free');
        if (dietaryInfo.halal) info.push('Halal');
        
        return info.join(', ');
    };

    return (
        <div className="fixed top-[140px] inset-0 bg-opacity-60 flex justify-center items-center z-20 backdrop-blur-md bg-black/30 bg-opacity-100">
            <div className="bg-[#fff5e5] max-w-md text-center fixed bottom-0 md:bottom-[30%] lg:bottom-[0%] xl:bottom-[10%] 2xl:bottom-[25%] mx-4 rounded-t-lg shadow-2xl">
                <button
                    className="absolute top-4 right-4 text-[#a86a30] text-5xl font-normal hover:cursor-pointer hover:text-[#8b5a26] transition-colors"
                    onClick={() => setSelectedItem(null)}
                >
                    &times;
                </button>
                
                <div className="w-[250px] h-[250px] mx-auto mb-4 mt-10 rounded-full bg-gray-200 overflow-hidden">
                    {selectedItem.image_url ? (
                        <Image
                            src={selectedItem.image_url}
                            alt={selectedItem.name}
                            className="w-full h-full object-cover hover:scale-105 transition-transform duration-300 cursor-pointer"
                            width={250}
                            height={250}
                            onError={(e) => {
                                e.target.style.display = 'none';
                                e.target.parentElement.querySelector('.fallback-image').style.display = 'flex';
                            }}
                        />
                    ) : null}
                    <div 
                        className={`fallback-image w-full h-full flex items-center justify-center text-[#a86a30] text-lg font-medium ${selectedItem.image_url ? 'hidden' : 'flex'}`}
                    >
                        No Image Available
                    </div>
                </div>
                
                <div className="px-10 mb-10">
                    <h2 className="text-xl font-semibold text-[#a86a30] mb-2 capitalize">
                        {selectedItem.name}
                    </h2>
                    
                    <div className="mb-4">
                        <span className="text-lg font-medium text-[#8b5a26]">
                            {formatPrice(selectedItem.price, selectedItem.currency)}
                        </span>
                        {!selectedItem.available && (
                            <span className="block text-red-600 text-sm font-medium mt-1">
                                Currently Unavailable
                            </span>
                        )}
                    </div>
                    
                    {selectedItem.description && (
                        <p className="text-[#a86a30] mb-4 text-center leading-relaxed">
                            {selectedItem.description}
                        </p>
                    )}
                    
                    {formatDietaryInfo(selectedItem.dietary_info) && (
                        <div className="mb-4">
                            <p className="text-sm font-medium text-[#8b5a26] mb-1">Dietary Information:</p>
                            <p className="text-sm text-[#a86a30]">
                                {formatDietaryInfo(selectedItem.dietary_info)}
                            </p>
                        </div>
                    )}
                    
                    {selectedItem.sub_category && (
                        <div className="text-xs text-[#8b5a26] opacity-75">
                            Category: {selectedItem.sub_category.name}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}