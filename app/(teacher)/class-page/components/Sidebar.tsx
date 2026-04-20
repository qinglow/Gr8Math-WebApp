import Image from 'next/image';
import classActiveIcon from '../photos/class-active.png';
import classInactiveIcon from '../photos/class.png';
import participantsActiveIcon from '../photos/participants-active.png';
import participantsIcon from '../photos/participants.png';
import dllActiveIcon from '../photos/dll-active.png';
import dllIcon from '../photos/dll.png';

export function Sidebar({ isOpen, setIsOpen, activeTab, setActiveTab, title, onBack }: any) {
    const tabs = [
        { id: 'class', label: 'Class', active: classActiveIcon, inactive: classInactiveIcon },
        { id: 'participants', label: 'Participants', active: participantsActiveIcon, inactive: participantsIcon },
        { id: 'dll', label: 'DLL', active: dllActiveIcon, inactive: dllIcon }
    ];

    return (
        <div className={`fixed top-0 left-0 md:sticky md:top-0 z-[50] h-screen flex flex-col bg-[#E9E9E9] border-r border-[#D1D8DD] w-[280px] transition-transform duration-300 ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
            <div className="p-8 pb-4">
                <button onClick={onBack} className="flex items-center gap-x-3 outline-none">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#222" strokeWidth="3"><path d="M15 18l-6-6 6-6" /></svg>
                    <h1 className="text-[22px] font-black text-[#222]">{title}</h1>
                </button>
            </div>
            <div className="flex flex-col gap-y-3 px-6 pt-6 flex-1">
                {tabs.map((tab) => (
                    <button 
                        key={tab.id}
                        onClick={() => { setActiveTab(tab.id); setIsOpen(false); }}
                        className={`flex items-center gap-x-4 px-5 py-3.5 rounded-xl font-bold transition-all border-2 outline-none ${activeTab === tab.id ? 'bg-[#0F8B8D]/80 border-[#EFBD31] text-[#EFBD31] shadow-sm' : 'bg-transparent border-transparent text-[#0F8B8D] hover:bg-[#D1D8DD]/50'}`}
                    >
                        <Image src={activeTab === tab.id ? tab.active : tab.inactive} alt={tab.label} width={24} height={24} />
                        <span className="text-[15px] tracking-wide">{tab.label}</span>
                    </button>
                ))}
            </div>
        </div>
    );
}