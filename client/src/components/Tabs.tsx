import { TabNames } from '@/utils/types'

interface TabsProps {
    selectedTab: TabNames
    setSelectedTab: (tab: TabNames) => void
}

interface TabButtonProps {
    tab: TabNames
    selectedTab: TabNames
    setSelectedTab: (tab: TabNames) => void
    width: string
}

function TabButton({ tab, selectedTab, setSelectedTab, width }: TabButtonProps) {
    const isActive = selectedTab === tab

    return (
        <button
            className={`py-2 text-center text-gray-700 focus:outline-none ${width}
                    ${
                        isActive
                            ? 'border-b-2 border-accent-light text-accent-light'
                            : 'border-b-2 border-gray-300 text-gray-500'
                    }
                    transition-colors duration-300 ease-in-out hover:text-accent-light`}
            onClick={() => setSelectedTab(tab)}
        >
            {tab}
        </button>
    )
}

function Tabs({ selectedTab, setSelectedTab }: TabsProps) {
    const tabs = Object.values(TabNames)
    return (
        <>
            <div className="flex justify-evenly mb-5">
                {tabs.slice(0, 2).map((tab) => (
                    <TabButton
                        key={tab}
                        tab={tab}
                        selectedTab={selectedTab}
                        setSelectedTab={setSelectedTab}
                        width="w-[45%]"
                    />
                ))}
            </div>
            <div className="flex justify-evenly mb-5">
                {tabs.slice(2).map((tab) => (
                    <TabButton
                        key={tab}
                        tab={tab}
                        selectedTab={selectedTab}
                        setSelectedTab={setSelectedTab}
                        width="w-[30%]"
                    />
                ))}
            </div>
            <div className="h-[4px] w-[90%] mx-auto border-2 border-accent rounded-full my-3"></div>
        </>
    )
}

export default Tabs
