export default function ItemCard({item,setSelectedItem}) {
    return(
        <div
            key={item}
            className="flex items-start gap-3 hover:cursor-pointer"
            onClick={() => setSelectedItem(item)}
        >
            <img
                src={item.image}
                alt={item.title}
                className="w-16 h-16 rounded-full object-cover flex-shrink-0"
            />
            <div className="text-sm space-y-1">
                <p className="font-semibold text-[15px] lg:text-[17px] xl:text-[19px]">
                {item.title} <span className="font-normal">{item.price} {item.dietary}</span>
                </p>
                <p className="text-[#5c4a2b] text-[15px]">{item.desc}</p>
            </div>
        </div>
    )
}