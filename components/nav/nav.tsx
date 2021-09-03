export const Nav = () => {
  const goToLanding = () => {
    window.location.href = "https://edorer.com";
  };
  return (
    <div className="nav-container">
      <div className="nav-left-side">
        <img className="logo" src="/images/logo.png" alt="" onClick={() => goToLanding()} />
      </div>
      <div className="nav-right-side"></div>
    </div>
  );
};
