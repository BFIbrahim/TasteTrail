import React from 'react';
import { Link } from 'react-router';
import { HiOutlineShieldExclamation, HiOutlineArrowNarrowLeft } from 'react-icons/hi';

const Forbidden = () => {
    return (
        <div className="min-h-screen bg-[#0F172A] flex items-center justify-center p-6 overflow-hidden relative">
            <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-red-500/10 blur-[100px] rounded-full"></div>
            <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-orange-500/10 blur-[120px] rounded-full"></div>

            <div className="max-w-2xl w-full text-center z-10 animate-fade-in transition-all duration-700">
                
                <div className="relative inline-block mb-8">
                    <div className="absolute inset-0 bg-red-500/20 blur-2xl rounded-full scale-150 animate-pulse"></div>
                    <div className="relative bg-slate-800 border border-slate-700 p-8 rounded-[2.5rem] shadow-2xl">
                        <HiOutlineShieldExclamation className="text-red-500 w-24 h-24" />
                    </div>
                </div>

                <h1 className="text-9xl font-black tracking-tighter mb-4">
                    <span className="bg-clip-text text-transparent bg-gradient-to-r from-red-500 via-orange-500 to-amber-500">
                        403
                    </span>
                </h1>

                <div className="space-y-4 mb-12">
                    <h2 className="text-3xl md:text-4xl font-bold text-white tracking-tight">
                        Access Denied
                    </h2>
                    <p className="text-slate-400 text-lg md:text-xl font-medium max-w-md mx-auto leading-relaxed">
                        Oops! It looks like you don't have permission to access this page. 
                        This area is reserved for <span className="text-red-400">Administrators</span> only.
                    </p>
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                    <Link 
                        to="/dashboard" 
                        className="btn btn-primary btn-lg rounded-2xl gap-3 px-8 shadow-lg shadow-primary/20 hover:scale-105 transition-transform border-none text-white"
                    >
                        <HiOutlineArrowNarrowLeft className="text-xl" />
                        Back to Dashboard
                    </Link>
                </div>
            </div>

            <style dangerouslySetInnerHTML={{ __html: `
                @keyframes fade-in {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-fade-in {
                    animation: fade-in 0.8s ease-out forwards;
                }
            `}} />
        </div>
    );
};

export default Forbidden;