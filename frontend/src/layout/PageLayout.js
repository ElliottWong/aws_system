import Title from '../common/Title';
import Header from './Header';
import Footer from './Footer';
import SideNav from '../common/sideNav/SideNav';

const PageLayout = ({ sideNavStatus, setSideNavStatus, title, activeLink, children }) => {

    return (
        <>
            <Title title={title} />
            <Header sideNavStatus={sideNavStatus} setSideNavStatus={setSideNavStatus} />
            <main className="l-Main__Outer">
                <SideNav sideNavStatus={sideNavStatus} activeLink={activeLink} />
                <div className={sideNavStatus ? "l-Main__Inner l-Main__Inner--uncollapsed" : "l-Main__Inner l-Main__Inner--collapsed"}>
                    {children}
                    <Footer />
                </div>

            </main>
        </>
    )
}

export default PageLayout;