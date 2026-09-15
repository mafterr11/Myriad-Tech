import Nav from "./Nav";
import NavMobile from "./NavMobile";
import Logo from "./Logo";

const Header = () => {
  return (
    <header className="mobile-static-header border-accent bg-body xl:bg-body/90 fixed inset-x-3 top-3 z-50 mx-auto w-[calc(100%-1.5rem)] max-w-[1380px] border text-black shadow-[0_10px_30px_rgba(103,72,57,0.08)] max-xl:inset-x-0 max-xl:top-0 max-xl:w-full max-xl:border-x-0 max-xl:border-t-0 xl:rounded-[2px] xl:backdrop-blur-md">
      <div className="flex items-center justify-between gap-6 px-5 py-3 sm:px-7 xl:px-8">
        <Logo wordmark source="/icon.svg" size={"h-7 sm:h-8"} />
        <div className="flex items-center gap-5 xl:gap-10">
          <Nav
            containerStyles="hidden xl:flex items-center gap-x-8"
            linkStyles="text-xs uppercase tracking-[0.16em]"
          />
          <NavMobile />
        </div>
      </div>
    </header>
  );
};

export default Header;
