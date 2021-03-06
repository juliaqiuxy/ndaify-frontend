import React, { useMemo, useEffect, useState } from 'react';
import Router from 'next/router';

import { loadStripe } from '@stripe/stripe-js';
import {
  Elements,
} from '@stripe/react-stripe-js';

import NdaifyService from '../../services/NdaifyService';
import useLocale from '../../lib/useLocale';

import * as sessionStorage from '../../lib/sessionStorage';
import { PageTitle, PageDescription } from '../../components/Head/Head';
import PaymentFormImpl from '../../components/PaymentForm/PaymentForm';

import { scrollToTop } from '../../util';

const PaymentForm = ({ user }) => {
  const [preferredLocale] = useLocale();
  const nda = useMemo(() => sessionStorage.getItem('nda'), []);

  const [stripePromise, setStripePromise] = useState(null);

  useEffect(() => {
    const promise = loadStripe(process.env.STRIPE_PUBLISHABLE_KEY);
    setStripePromise(promise);

    return () => {
      // TODO(juliaqiuxy) Can we unload stripe here to stop it from tracking users?
    };
  }, []);

  useEffect(() => {
    if (process.browser && !nda) {
      Router.replace('/').then(scrollToTop);
    }
  }, [nda]);

  if (process.browser && !nda) {
    return null;
  }

  return (
    <>
      <PageTitle />
      <PageDescription />
      <Elements key={preferredLocale} stripe={stripePromise} options={{ locale: preferredLocale || 'auto' }}>
        <PaymentFormImpl user={user} nda={nda} />
      </Elements>
    </>
  );
};

PaymentForm.getInitialProps = async (ctx) => {
  const ndaifyService = new NdaifyService({ ctx });

  const { user } = await NdaifyService.withCache(
    ['session'],
    (queryKey, data) => ({ user: data }),
    () => ndaifyService.getSession(),
  );

  return {
    user,
  };
};

export default PaymentForm;
