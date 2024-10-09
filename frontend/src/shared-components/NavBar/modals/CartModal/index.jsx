import { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { useSelector } from "react-redux";
import LoadingSpinner from "../../../../shared-components/LoadingSpinner";
import * as cartService from "../../../../services/cart";
import CartItem from "./CartItem";
import clsx from "clsx";

const CartModal = ({ setCartOpen }) => {
    const [isLoading, setIsLoading] = useState(true);
    const [items, setItems] = useState([]);
    const username = useSelector((state) => state.session.user?.username);

    const fetchCart = useCallback(async() => {
        setIsLoading(true);
        const response = await cartService.getCart();
        setItems(await response.json());
        setIsLoading(false);
    }, []);

    useEffect(() => {
        fetchCart();
    }, [fetchCart]);

    let totalQuantity = 0;
    let subTotal = 0;
    for (let item of items) {
        totalQuantity += item.quantity;
        subTotal += item.quantity * item.price_per_unit;
    }

    return (
        <motion.div
            initial={{ translateX: "100%" }}
            animate={{ translateX: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-white h-screen w-full max-w-xl flex flex-col"
        >
            <div className="bg-emerald-800 text-white font-playfair text-center text-3xl py-7 shadow-md">
                <div>{username}'s Cart</div>
                <button 
                    onClick={() => setCartOpen(false)}
                    className="fixed top-2 right-2 text-sm bg-emerald-700 w-6 h-6 rounded-full">
                    <i className="fa-solid fa-x"></i>
                </button>
            </div>
            {isLoading ? (
                <LoadingSpinner />
            ) : (
                <>
                    <div className="flex-1 overflow-y-scroll pb-20">
                        {items.map((item, idx) => (
                            <div
                                className={clsx(
                                    "mx-5 pt-8 mt-8",
                                    idx !== 0 && "border-t border-slate-300"
                                )}
                                key={item.id}
                            >
                                <CartItem item={item} fetchCart={fetchCart} />
                            </div>
                        ))}
                    </div>
                    <div className="flex flex-col px-4 border-t border-slate-300 pb-4">
                        <div className="flex justify-between py-4 text-slate-400">
                            <div>{totalQuantity} items</div>
                            <div>
                                subtotal
                                <span className="text-lg text-slate-500 ml-2">
                                    ${subTotal}
                                </span>
                            </div>
                        </div>
                        <button
                            onClick={() =>
                                alert(
                                    "this app is not a real plant selling site :)"
                                )
                            }
                            className="bg-emerald-700 rounded-full flex justify-center items-center py-3 text-lg text-white "
                        >
                            checkout
                            <i className="fa-regular fa-arrow-right-to-line ml-2 text-2xl"></i>
                        </button>
                    </div>
                </>
            )}
        </motion.div>
    );
};

export default CartModal;
