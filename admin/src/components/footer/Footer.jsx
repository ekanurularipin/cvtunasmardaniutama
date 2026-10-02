const Footer = () => {
  return (
    <div className="flex w-full flex-col items-center justify-between px-1 pb-8 pt-3 lg:px-8 xl:flex-row">
      <h5 className="mb-4 text-center text-sm font-medium text-gray-600 sm:!mb-0 md:text-lg">
        <p className="mb-4 text-center text-sm text-gray-600 sm:!mb-0 md:text-base">
          ©{1900 + new Date().getYear()} Eka Nurularipin. All Rights Reserved by{" "} by <a href="https://www.instagram.com/ekanurularipin/" target="_blank" rel="noreferrer" className="text-green-600 hover:text-green-700 font-semibold">Eka Nurularipin</a> • Distributed by <a href="https://www.instagram.com/escodigital2024/" target="_blank" rel="noreferrer" className="text-green-600 hover:text-green-700 font-semibold">Esco</a>
        </p>
      </h5>
    </div>
  );
};

export default Footer;
