import Banner from "./components/Banner";


import HistoryCard from "./components/HistoryCard";
import TopCreatorTable from "./components/TableTopCreators";

const Marketplace = () => {
  return (
    <div className="mt-3 grid h-full grid-cols-1 gap-7 xl:grid-cols-2 2x2:grid-cols-3">
      <div className="col-span-1 h-fit w-full xl:col-span-1 2xl:col-span-2">
        {/* NFt Banner */}
        <Banner />
        <TopCreatorTable
        />
        <HistoryCard />
      </div>
    </div>
  );
};

export default Marketplace;
