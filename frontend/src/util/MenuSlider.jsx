import React, { useState } from 'react';

const Sidebar = () => {
    const [ismenuOpen, setIsMenuOpen] = useState(false);

    return (
        <div className="relative">
            {/* Button to toggle the menu */}
            <button onClick={() => setIsMenuOpen(true)} className="p-4 bg-blue-500 text-white rounded">
                Open Menu
            </button>

            {/* Menu overlay - visible only when ismenuOpen is true */}
            <div
                className={`fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 z-40 transition-opacity duration-300 ${
                    ismenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
                }`}
                onClick={() => setIsMenuOpen(false)}
            ></div>

            {/* The sliding menu content */}
            <div
                className={`fixed top-0 left-0 w-1/2 h-screen bg-white shadow-lg z-50 transform transition-transform duration-700 ease-in-out ${
                    ismenuOpen ? 'translate-x-0' : '-translate-x-full'
                }`}
            >
                <div className="p-4">
                    <button
                        onClick={() => setIsMenuOpen(false)}
                        className="text-gray-500 hover:text-gray-700 absolute top-2 right-2"
                    >
                        &times;
                    </button>
                    <h2 className="text-xl font-bold">Menu is on</h2>
                    <ul className="mt-4 space-y-2">
                        <li>Menu Item 1</li>
                        <li>Menu Item 2</li>
                        <li>Menu Item 3</li>
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default Sidebar;