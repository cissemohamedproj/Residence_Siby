import React from 'react';

import { connect } from 'react-redux';

//i18n
import { withTranslation } from 'react-i18next';

// Redux Store
import {
  showRightSidebarAction,
  toggleLeftmenu,
  changeSidebarType,
} from '../../store/actions';
import ProfileMenu from '../../components/Common/TopbarDropdown/ProfileMenu';
import {
  companyLittleName,
  companyServices2,
  logo_small,
} from '../../Pages/CompanyInfo/CompanyInfo';

const Header = (props) => {
  function toggleFullscreen() {
    if (
      !document.fullscreenElement &&
      /* alternative standard method */ !document.mozFullScreenElement &&
      !document.webkitFullscreenElement
    ) {
      // current working methods
      if (document.documentElement.requestFullscreen) {
        document.documentElement.requestFullscreen();
      } else if (document.documentElement.mozRequestFullScreen) {
        document.documentElement.mozRequestFullScreen();
      } else if (document.documentElement.webkitRequestFullscreen) {
        document.documentElement.webkitRequestFullscreen(
          Element.ALLOW_KEYBOARD_INPUT
        );
      }
    } else {
      if (document.cancelFullScreen) {
        document.cancelFullScreen();
      } else if (document.mozCancelFullScreen) {
        document.mozCancelFullScreen();
      } else if (document.webkitCancelFullScreen) {
        document.webkitCancelFullScreen();
      }
    }
  }

  function tToggle() {
    var body = document.body;
    if (window.screen.width <= 998) {
      body.classList.toggle('sidebar-enable');
    } else {
      body.classList.toggle('vertical-collpsed');
      body.classList.toggle('sidebar-enable');
    }
  }

  return (
    <React.Fragment>
      <header id='page-topbar'>
        <div className='navbar-header'>
          <div className='d-flex align-items-center '>
            <div className='navbar-brand-box text-center  bg-light'>
              <span className='logo-sm'>
                <img src={logo_small} alt='logo' height='64' />
              </span>
            </div>

            <button
              type='button'
              className='btn btn-sm px-3 font-size-24 header-item waves-effect  '
              id='vertical-menu-btn'
              onClick={() => {
                tToggle();
              }}
            >
              <i className='fas fa-align-justify align-middle text-warning'></i>
            </button>
          </div>
          <div className='d-none d-md-flex flex-column justify-content-center align-items-center text-center flex-grow-1 px-2 rs-header-title-block'>
            <h3 className='text-info fw-bold'>{companyLittleName}</h3>
            <p className='text-warning mb-0'>{companyServices2}</p>
          </div>

          <div className='d-flex'>
            <div className='dropdown d-none d-lg-inline-block ms-1'>
              <button
                type='button'
                onClick={() => {
                  toggleFullscreen();
                }}
                className='btn header-item noti-icon'
                data-toggle='fullscreen'
              >
                <i className='ri-fullscreen-line' />
              </button>
            </div>

            <ProfileMenu />
          </div>
        </div>
      </header>
    </React.Fragment>
  );
};

const mapStatetoProps = (state) => {
  const { layoutType, showRightSidebar, leftMenu, leftSideBarType } =
    state.Layout;
  return { layoutType, showRightSidebar, leftMenu, leftSideBarType };
};

export default connect(mapStatetoProps, {
  showRightSidebarAction,
  toggleLeftmenu,
  changeSidebarType,
})(withTranslation()(Header));
