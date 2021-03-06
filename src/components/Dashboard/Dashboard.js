import React from 'react';
import Link from 'next/link';

import styled from 'styled-components';
import { FormattedDate, FormattedMessage } from 'react-intl';

import UserActionBanner from '../UserActionBanner/UserActionBanner';
import Footer from '../Footer/Footer';
import ButtonAnchor from '../Clickable/ButtonAnchor';
import ActiveLink from '../ActiveLink/ActiveLink';
import UserActionsDropdown from '../UserActionsDropdown/UserActionsDropdown';
import Avatar from '../Avatar/Avatar';
import NdaActionsDropdown from './NdaActionsDropdown';

import getFullNameFromUser from '../NDA/getFullNameFromUser';

import CalendarIcon from './images/calendar.svg';
import RightArrow from './images/rightArrow.svg';

const RightArrowIcon = styled(RightArrow)`
  color: var(--ndaify-accents-9);
`;

const Container = styled.div`
  width: 100%;
  height: 100%;
  justify-content: center;
  display: flex;
  align-items: center;
  flex-direction: column;
  box-sizing: border-box;
`;

const PageContainer = styled.div`
  padding: 1pc;
  display: flex;
  justify-content: center;
  align-items: center;
  max-width: 768px;
  width: 100%;
  flex: 1;
  flex-direction: column;
  box-sizing: border-box;
`;

const DashboardActionRow = styled.div`
  padding-top: 2pc;
  padding-bottom: 2pc;
  display: flex;
  width: 100%;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1pc;
`;

const LinksContainer = styled.div`

`;

const StyledLink = styled.a`
  font-size: 20px;
  color: var(--ndaify-fg);
  font-weight: 200;
  margin-right: 2pc;
  padding-bottom: 6px;
  border-bottom: ${({ active }) => active && '4px solid var(--ndaify-accents-9)'};
  cursor: pointer;
  text-decoration: none;

  :visited {
    color: var(--ndaify-fg);
  }

  @media screen and (min-width: 992px) {
    font-size: 24px;
  }
`;

const HistoryList = styled.div`
  width: 100%;
`;

const ItemCardContainer = styled.a`
  display: flex;
  border: 1px solid #4E5263;
  border-radius: var(--ndaify-accents-radius-1);
  margin-bottom: 1pc;
  cursor: pointer;
  text-decoration: none;

  ${(props) => (props.pending ? 'border-color: var(--ndaify-accents-9);' : '')}
`;

const RightArrowContainer = styled.div`
  display: none;

  @media screen and (min-width: 768px) {
    display: flex;
    align-items: center;
    margin-right: 1pc;
  }
`;

const RightArrowIconwrapper = styled.div`
  svg {
    width: 20px;
  }
`;

const HistoryItemContainer = styled.div`
  box-sizing: border-box;
  width: 100%;
  padding: 1pc 2pc 1pc 2pc;
`;

const HistoryTimeRow = styled.div`
  width: 100%;
  display: flex;
  align-items: center;
  margin-bottom: 1pc;
`;

const CalendarIconWrapper = styled.div`
  margin-right: 1pc;
  
  svg {
    width: 24px;
    color: var(--ndaify-accents-6);
  }
`;

const EmptyHistoryList = styled.span`
  font-size: 20px;
  color: var(--ndaify-fg);
  font-weight: 700;

  @media screen and (min-width: 992px) {
    font-size: 24px;
  }
`;

const HistoryTimeText = styled.span`
  font-size: 20px;
  color: var(--ndaify-fg);
  font-weight: 200;

  @media screen and (min-width: 992px) {
    font-size: 24px;
  }
`;

const RecipientRow = styled.div`
  margin-bottom: 1pc;
`;

const HistoryItemTitle = styled.div`
  font-size: 16px;
  color: var(--ndaify-accents-6);
  width: 100%;
  line-height: 32px;
`;

const RecipientInfoText = styled.div`
  display: block;
  font-size: 20px;
  color: var(--ndaify-fg);
  font-weight: 200;
  text-overflow: ellipsis;
  white-space: nowrap;
  overflow: hidden;

  @media screen and (min-width: 992px) {
    font-size: 24px;
  }
`;

const TypeAndStatusRow = styled.div`
  display: flex;
  flex-direction: column;

  @media screen and (min-width: 576px) {
    flex-direction: row;
  }
`;

const TypeContainer = styled.div`
  margin-right: 3pc;
`;

const StatusContainer = styled.div`

`;

const StatusText = styled(RecipientInfoText)`
  color: var(--ndaify-accents-9);
`;

const StyledBadgeLink = styled(StyledLink)`
  position: relative;
`;

const Badge = styled.span`
  background-color: var(--ndaify-accents-danger);
  border-radius: var(--ndaify-accents-radius-3);
  color: #FFFFFF;
  font-size: 12px;
  font-weight: 700;
  padding: 2px 6px;
  margin: 2px;
  position: absolute;
  top: -6px;
  right: -20px;
`;

const HistoryItemWrapper = styled.div`
  position: relative;
`;

const HistoryItemActions = styled.div`
  position: absolute;
  right: 1pc;
  top: 1pc;
`;

const NDA_STATUS_LABEL = {
  pending: 'Unsigned',
  signed: 'Signed',
  revoked: 'Revoked',
  declined: 'Declined',
};

const HistoryItem = ({ dashboardType, ndaType, nda }) => (
  <HistoryItemWrapper>
    <HistoryItemActions>
      <NdaActionsDropdown nda={nda} />
    </HistoryItemActions>
    <Link passHref href="/nda/[ndaId]" as={`/nda/${nda.ndaId}`}>
      <ItemCardContainer pending={nda.metadata.status === 'pending'}>
        <HistoryItemContainer>
          <HistoryTimeRow>
            <CalendarIconWrapper>
              <CalendarIcon />
            </CalendarIconWrapper>
            <HistoryTimeText>
              <FormattedDate
                year="numeric"
                month="long"
                day="numeric"
                value={nda.createdAt}
              />
            </HistoryTimeText>
          </HistoryTimeRow>

          {
              dashboardType === 'incoming' ? (
                <RecipientRow>
                  <HistoryItemTitle>
                    <FormattedMessage
                      id="dashboard-history-item-sender-title"
                      defaultMessage="Sender"
                    />
                  </HistoryItemTitle>
                  <RecipientInfoText>{`${getFullNameFromUser(nda.owner)} <${nda.owner.metadata.linkedInProfile.emailAddress}>`}</RecipientInfoText>
                </RecipientRow>
              ) : (
                <RecipientRow>
                  <HistoryItemTitle>
                    <FormattedMessage
                      id="dashboard-history-item-recipient-title"
                      defaultMessage="Recipient"
                    />
                  </HistoryItemTitle>
                  <RecipientInfoText>{`${nda.metadata.recipientFullName} <${nda.recipientEmail === 'void' ? nda.recipient.metadata.linkedInProfile.emailAddress : nda.recipientEmail}>`}</RecipientInfoText>
                </RecipientRow>
              )
            }
          <TypeAndStatusRow>
            <TypeContainer>
              <HistoryItemTitle>
                <FormattedMessage
                  id="dashboard-history-item-type-title"
                  defaultMessage="Type"
                />
              </HistoryItemTitle>
              <RecipientInfoText>
                { ndaType }
              </RecipientInfoText>
            </TypeContainer>
            <StatusContainer>
              <HistoryItemTitle>
                <FormattedMessage
                  id="dashboard-history-item-status-title"
                  defaultMessage="Status"
                />
              </HistoryItemTitle>
              <StatusText>{NDA_STATUS_LABEL[nda.metadata.status]}</StatusText>
            </StatusContainer>
          </TypeAndStatusRow>
        </HistoryItemContainer>
        <RightArrowContainer>
          <RightArrowIconwrapper>
            <RightArrowIcon />
          </RightArrowIconwrapper>
        </RightArrowContainer>
      </ItemCardContainer>
    </Link>
  </HistoryItemWrapper>
);

const Dashboard = ({
  dashboardType,
  user,
  ndas,
  ndaTemplateOptions,
}) => {
  const byIncoming = (nda) => nda.ownerId !== user.userId;
  const byOugoing = (nda) => nda.ownerId === user.userId;
  const byDashboardType = dashboardType === 'incoming' ? byIncoming : byOugoing;

  const filteredNdas = ndas.filter(byDashboardType);
  const incomingNdas = ndas.filter(byIncoming);

  // TODO This should be moved to api once we implement pagination
  const pendingIncomingNDAs = incomingNdas.filter((nda) => nda.metadata.status === 'pending');

  return (
    <Container>

      <UserActionBanner
        user={user}
        actionButton={() => (
          <>
            <Link passHref href="/dashboard/[dashboardType]" as="/dashboard/incoming">
              <ButtonAnchor
                outline
                style={{ borderTopRightRadius: 0, borderBottomRightRadius: 0 }}
              >
                <Avatar user={user} />

                <span>
                  <FormattedMessage
                    id="user-action-banner-label-inbox"
                    defaultMessage="Inbox"
                  />
                </span>
              </ButtonAnchor>
            </Link>

            <UserActionsDropdown user={user} />
          </>
        )}
      />

      <PageContainer>

        <DashboardActionRow>
          <LinksContainer>
            <ActiveLink scroll={false} href="/dashboard/[dashboardType]" as="/dashboard/incoming">
              {
                (active) => (
                  <StyledBadgeLink active={active}>
                    <FormattedMessage
                      id="dashboard-inbox-label"
                      defaultMessage="Inbox"
                    />

                    {
                      pendingIncomingNDAs.length ? (
                        <Badge>
                          {pendingIncomingNDAs.length}
                        </Badge>
                      ) : null
                    }
                  </StyledBadgeLink>
                )
              }
            </ActiveLink>
            <ActiveLink scroll={false} href="/dashboard/[dashboardType]" as="/dashboard/outgoing">
              {
                (active) => (
                  <StyledLink active={active}>
                    <FormattedMessage
                      id="dashboard-sent-label"
                      defaultMessage="Sent"
                    />
                  </StyledLink>
                )
              }
            </ActiveLink>
          </LinksContainer>
          <Link passHref href="/">
            <ButtonAnchor outline>
              <FormattedMessage
                id="dashboard-new-button"
                defaultMessage="New"
              />
            </ButtonAnchor>
          </Link>
        </DashboardActionRow>

        {
          filteredNdas.length > 0 ? (
            <HistoryList>
              {
                filteredNdas.map((nda) => (
                  <HistoryItem
                    key={nda.ndaId}
                    nda={nda}
                    dashboardType={dashboardType}
                    ndaType={
                      ndaTemplateOptions.find(
                        (option) => option.ndaTemplateId === nda.metadata.ndaTemplateId,
                      ).data.title
                    }
                  />
                ))
              }
            </HistoryList>
          ) : (
            <EmptyHistoryList>
              {
                dashboardType === 'incoming' ? (
                  <FormattedMessage
                    id="dashboard-empty-inbox-text"
                    defaultMessage="You have nothing in your inbox"
                  />
                ) : (
                  <FormattedMessage
                    id="dashboard-empty-sent-text"
                    defaultMessage="You have not sent NDAs"
                  />
                )
              }
            </EmptyHistoryList>
          )
        }

        <Footer withLogo />

      </PageContainer>
    </Container>
  );
};

export default Dashboard;
