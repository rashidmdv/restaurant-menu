export default function ItemCard({ item, setSelectedItem }) {
    const formatPrice = (price, currency = 'AED') => {
        return `${currency} ${price?.toFixed(2) || '0.00'}`;
    };

    const formatDietaryInfo = (dietaryInfo) => {
        if (!dietaryInfo || typeof dietaryInfo !== 'object') return '';
        
        const info = [];
        if (dietaryInfo.vegetarian) info.push('(v)');
        if (dietaryInfo.vegan) info.push('(vg)');
        if (dietaryInfo.gluten_free) info.push('(gf)');
        if (dietaryInfo.dairy_free) info.push('(df)');
        if (dietaryInfo.halal) info.push('(h)');
        
        return info.join(' ');
    };

    return (
        <div
            className="flex items-start gap-3 hover:cursor-pointer hover:bg-[#f5ead5] p-2 rounded-lg transition-colors"
            onClick={() => setSelectedItem(item)}
        >
            <div className="w-16 h-16 rounded-full bg-gray-200 flex-shrink-0 overflow-hidden">
                {item.image_url ? (
                    <img
                        src={item.image_url}
                        alt={item.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.nextSibling.style.display = 'flex';
                        }}
                    />
                ) : null}
                <div 
                    className={`w-full h-full flex items-center justify-center text-[#bc7a2e] text-xs font-medium ${item.image_url ? 'hidden' : 'flex'}`}
                    style={{ display: item.image_url ? 'none' : 'flex' }}
                >
                    No Image
                </div>
            </div>
            
            <div className="text-sm space-y-1 flex-1">
                <div className="flex flex-wrap items-start justify-between gap-1">
                    <h3 className="font-semibold text-[15px] lg:text-[17px] xl:text-[19px] capitalize leading-tight">
                        {item.name}
                    </h3>
                    <div className="flex items-center gap-2 text-[15px] lg:text-[17px] xl:text-[19px]">
                        <span className="font-normal">
                            {formatPrice(item.price, item.currency)}
                        </span>
                        {formatDietaryInfo(item.dietary_info) && (
                            <span className="font-normal text-[#5c4a2b]">
                                {formatDietaryInfo(item.dietary_info)}
                            </span>
                        )}
                    </div>
                </div>
                
                {item.description && (
                    <p className="text-[#5c4a2b] text-[15px] leading-relaxed">
                        {item.description}
                    </p>
                )}
                
                {!item.available && (
                    <p className="text-red-600 text-xs font-medium">Currently unavailable</p>
                )}
            </div>
        </div>
    );
}