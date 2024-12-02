import { rupee } from "../assets/Images/Images";
import Count from "./Count";

export default function BuyPhone({ qty, price }) {
  return (
    <div className="w-full gap-3 flex transition-all md:hidden flex-col justify-evenly max-h-[25rem] h-fit px-4 py-4 bg-white rounded-t-3xl items-start">
      <h1 className="title text-4xl font-extrabold">
        100% Pure & Natural Apis Cerana Honey
      </h1>
      <p className="weight text-lg font-medium">{qty}kg</p>
      <div className="price&Count w-full flex justify-between items-center">
        <div className="price flex justify-center items-center">
          <h1 className="text-3xl font-extrabold">{price}</h1>
          <img src={rupee} className="w-6" alt="" />
        </div>
        <Count/>
      </div>
      <button className="bg-main opacity-40 hover:scale-105 transition-all w-full text-active text-3xl font-bold py-2 rounded-full">Out of Stock</button>
    </div>
  );
}