import React, { useCallback } from 'react';
import styled from 'styled-components';
import humps from 'humps';
import { FormattedNumber } from 'react-intl';

import {
  CardElement as StripeCardElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';

import {
  Formik,
  Field as FormikField,
  Form,
} from 'formik';

import Router from 'next/router';

import loggerClient from '../../db/loggerClient';

import NdaifyService from '../../services/NdaifyService';

import Button from '../Clickable/Button';
import Input from '../Input/Input';
import Footer from '../Footer/Footer';
import CreatorInfo from '../CreatorInfo/CreatorInfo';
import ErrorMessage from '../ErrorMessage/ErrorMessage';
import UserActionBanner from '../UserActionBanner/UserActionBanner';
import FieldErrorMessage from '../ErrorMessage/FieldErrorMessage';
import StripeInput from '../Input/StripeInput';
import PaymentAmountButtonGroup, { DOLLAR_IN_CENTS } from '../Input/PaymentAmountButtonGroup';
import getFullNameFromUser from '../NDA/getFullNameFromUser';

import { scrollToTop } from '../../util';

const Container = styled.div`
  width: 100%;
  height: 100%;
  justify-content: center;
  align-items: center;
  display: flex;
  flex-direction: column;
`;

const ContentContainer = styled.div`
  padding: 1pc;
  display: flex;
  justify-content: center;
  align-items: center;
  max-width: 768px;
  width: 100%;
  margin-top: 3pc;
  padding-top: 2pc;
  flex-direction: column;
  flex: 1;
  box-sizing: border-box;
`;

const DialogContainer = styled.div`
  margin-bottom: 5pc;
`;

const DialogTitle = styled.h3`
  font-size: 28px;
  margin: 0;
  margin-bottom: 2pc;
  font-weight: 400;
  text-align: center;
  color: var(--ndaify-fg);

  @media screen and (min-width: 992px) {
    font-size: 32px;
  }
`;

const DialogLongText = styled.p`
  font-size: 16px;
  margin: 0;
  margin-bottom: 1pc;
  color: var(--ndaify-fg);
  font-weight: 200;

  @media screen and (min-width: 992px) {
    font-size: 20px;
  }

  :last-of-type {
    margin-bottom: 0;
  }
`;

const UnderlineText = styled.span`
  text-decoration: underline;
`;

const PaymentFormContainer = styled.div`
  max-width: 576px;
  width: 100%;
  margin: 2pc;
  display: flex;
  flex-direction: column;
  justify-content: center;
  box-sizing: border-box;
`;

const DividerContainer = styled.div`
  display: flex;
  justify-content: space-between;
  display: flex;
  align-items: center;
  margin-top: 1pc;
`;

const DividerLine = styled.div`
  height: 3px;
  width: 200px;
  color: var(--ndaify-accents-6);
  margin-left: 1pc;
  margin-right: 1pc;
`;

const DividerText = styled.span`
  color: var(--ndaify-accents-6);
  text-transform: uppercase;
  font-size: 16px;
  font-weight: 700;

  @media screen and (min-width: 992px) {
    font-size: 20px;
  }
`;

const Total = styled.h4`
  font-size: 20px;
  margin-top: 2pc;
  font-weight: 200;
  color: var(--ndaify-accents-6);

  @media screen and (min-width: 992px) {
    font-size: 24px;
  }
`;

const Dialog = styled.div`
  height: 100%;
  position: relative;
  background-color: var(--ndaify-bg-overlay);
  border-radius: var(--ndaify-accents-radius-1);
  line-height: 28px;
  padding: 2pc;
  margin-bottom: 2pc;

  :after {
    content: "";
    position: absolute;
    bottom: 0;
    left: 6%;
    width: 0;
    height: 0;
    border: 12px solid transparent;
    border-top-color: var(--ndaify-bg-overlay);
    border-bottom: 0;
    border-right: 0;
    margin-left: -6px;
    margin-bottom: -12px;
  }
`;

const CURRENCY = 'USD';

const Divider = () => (
  <DividerContainer>
    <DividerLine />
    <DividerText>Or</DividerText>
    <DividerLine />
  </DividerContainer>
);

const PaymentForm = ({ user, nda: ndaPayload }) => {
  const stripe = useStripe();
  const elements = useElements();

  const handleSubmit = async (
    values,
    {
      setStatus,
    },
  ) => {
    // clear all error messages before retrying
    setStatus();

    const ndaifyService = new NdaifyService();

    try {
      let paymentIntentId;

      // User wants to donate!
      if (!values.noPaymentReason && values.stripeEntry?.complete) {
        const { paymentIntent } = await ndaifyService.createPaymentIntent(
          values.paymentAmount /* in cents */,
          CURRENCY,
        );

        const cardPaymentPayload = humps.decamelizeKeys({
          receiptEmail: user.metadata.linkedInProfile.emailAddress,
          paymentMethod: {
            billingDetails: {
              name: values.nameOnCard,
            },
          },
        });

        // We can decamelize `card` so we have to live with that snake case,
        // Stripe I'm lookin' at ya!
        cardPaymentPayload.payment_method.card = elements.getElement(StripeCardElement);

        const cardPayment = await stripe.confirmCardPayment(
          paymentIntent.clientSecret,
          cardPaymentPayload,
        );

        if (cardPayment.error) {
          throw Error(`${cardPayment.error.message}`);
        }

        paymentIntentId = cardPayment.paymentIntent.id;
      }

      const { nda } = await ndaifyService.createNda({
        ...ndaPayload,
        metadata: {
          ...ndaPayload.metadata,
          paymentIntentId,
          noPaymentReason: values.noPaymentReason || null,
        },
      });

      Router.replace('/nda/sent/[ndaId]', `/nda/sent/${nda.ndaId}`).then(scrollToTop);
    } catch (error) {
      loggerClient.error(error);
      setStatus({ errorMessage: error.message });
    }
  };
  const onSubmit = useCallback(handleSubmit, [stripe, elements]);

  const handleCancelClick = () => {
    Router.replace('/').then(scrollToTop);
    sessionStorage.clear();
  };
  const onCancelClick = useCallback(handleCancelClick, []);

  const handleFormValidate = (values) => {
    const errors = {};
    if (!values.noPaymentReason) {
      if (!values.nameOnCard) {
        errors.nameOnCard = 'Please enter name of the card holder';
      } else if (values.stripeEntry?.error) {
        errors.stripeEntry = values.stripeEntry?.error.message;
      } else if (!values.stripeEntry?.complete) {
        errors.noPaymentReason = 'Please provide a reason to skip payment';
      }
    }

    return errors;
  };
  const onFormValidate = useCallback(handleFormValidate, []);

  const initialValues = {
    nameOnCard: getFullNameFromUser(user),
    stripeEntry: null,
    noPaymentReason: '',
    paymentAmount: 5 * DOLLAR_IN_CENTS, /* in cents */
  };

  return (
    <Container>
      <UserActionBanner
        user={user}
        actionButton={() => (
          <Button
            outline
            onClick={onCancelClick}
          >
            Cancel
          </Button>
        )}
      />

      <ContentContainer>
        <DialogContainer>
          <DialogTitle>One last thing before delivery…</DialogTitle>

          <Dialog>
            <DialogLongText>
              Hi
              {' '}
              {user.metadata.linkedInProfile.firstName}
              ,
            </DialogLongText>
            <DialogLongText>
              It costs money to keep NDAify running. If you use the service and
              find it valuable, plese help me stay online by making a small
              donation.
            </DialogLongText>
            <DialogLongText>
              Or, share a good reason below for why you can’t pay and you can
              still use NDAify for
              {' '}
              <UnderlineText>free</UnderlineText>
              .
            </DialogLongText>

            <DialogLongText>
              Any questions or comments? Just send me a tweet, I’m always
              listening.
            </DialogLongText>
            <DialogLongText>Thank you for using NDAify!</DialogLongText>
          </Dialog>
          <CreatorInfo />
        </DialogContainer>

        <PaymentFormContainer>
          <Formik
            initialValues={initialValues}
            validate={onFormValidate}
            validateOnChange={false}
            validateOnBlur={Object.keys(initialValues).length > 1}
            onSubmit={onSubmit}
          >
            {({ values, status, isSubmitting }) => (
              <Form>
                {
                  status ? (
                    <ErrorMessage style={{ marginBottom: '3pc' }}>
                      {status.errorMessage}
                    </ErrorMessage>
                  ) : null
                }

                <div style={{ marginBottom: '2pc' }}>
                  <FormikField
                    as={PaymentAmountButtonGroup}
                    name="paymentAmount"
                  />
                  <FieldErrorMessage style={{ marginTop: '1pc' }} name="paymentAmount" component="div" />
                </div>

                <div style={{ marginBottom: '2pc' }}>
                  <FormikField
                    as={Input}
                    autoCapitalize="none"
                    autoComplete="off"
                    autoCorrect="off"
                    name="nameOnCard"
                    placeholder="Name on card"
                    spellCheck={false}
                  />
                  <FieldErrorMessage style={{ marginTop: '1pc' }} name="nameOnCard" component="div" />
                </div>

                <FormikField
                  as={StripeInput}
                  name="stripeEntry"
                />
                <FieldErrorMessage style={{ marginTop: '1pc' }} name="stripeEntry" component="div" />

                <Divider />

                <div style={{ marginTop: '1pc' }}>
                  <FormikField
                    as={Input}
                    autoCapitalize="none"
                    autoComplete="off"
                    autoCorrect="off"
                    name="noPaymentReason"
                    placeholder="I can’t pay because…"
                    spellCheck={false}
                  />
                  <FieldErrorMessage style={{ marginTop: '1pc' }} name="noPaymentReason" component="div" />
                </div>

                <Total>
                  Total
                  {' '}
                  <FormattedNumber
                    value={values.paymentAmount / DOLLAR_IN_CENTS}
                    // eslint-disable-next-line react/style-prop-object
                    style="currency"
                    currency={CURRENCY}
                  />
                </Total>

                <Button
                  type="submit"
                  disabled={isSubmitting || !stripe || !elements}
                  style={{ backgroundColor: 'var(--ndaify-accents-success)' }}
                  spin={isSubmitting || !stripe || !elements}
                >
                  Submit
                </Button>
              </Form>
            )}
          </Formik>
        </PaymentFormContainer>
        <Footer withLogo />
      </ContentContainer>
    </Container>
  );
};

export default PaymentForm;
