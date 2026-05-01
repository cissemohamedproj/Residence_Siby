import {
  companyAdresse,
  companyLogo,
  companyServices1,
  companyServices2,
  companyTel,
  homeImg,
} from '../CompanyInfo/CompanyInfo';

export default function RecuHeader() {
  return (
    <div className='rs-recu-header d-flex flex-column justify-content-center align-items-center position-relative'>
      <h3 className='text-info'>RESIDENCE SIBY </h3>
      <img
        src={companyLogo}
        alt='Logo'
        className='rs-recu-header-logo-left'
      />
      <h6 className='text-center text-light bg-info font-size-11 px-2 py-1 rounded-3 mx-auto mb-2 rs-recu-header-badge'>
        {' '}
        Commerce Général & Immobilier
      </h6>
      <div className='text-info font-size-11 d-flex flex-column gap-0 justify-content-center align-item-center text-center mb-2'>
        <strong>{companyServices1}</strong>
        <strong>{companyServices2}</strong>
        <strong>{companyAdresse}</strong>

        <strong className='font-size-12'>Info: {companyTel}</strong>
      </div>
      <img
        src={homeImg}
        alt='Logo'
        className='rs-recu-header-img-right'
      />
    </div>
  );
}
