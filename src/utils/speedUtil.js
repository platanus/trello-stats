import moment from 'moment';
import { getDate } from './dateManager.js';

moment().format('yyyy-MM-dd');

function sortDate(activity1, activity2) {
  return moment(activity1.date).diff(activity2.date, 'days');
}

function filterDuplicates(activities) {
  return activities
    .filter((activity) =>
      activities.filter((filteredActivity) => filteredActivity.id === activity.id).length === 1
    ).concat(Object.values(
      activities.filter((activity) =>
        activities.filter((filteredActivity) => filteredActivity.id === activity.id).length > 1
      ).reduce((acc, cur) => Object.assign(acc, { [cur.id]: cur }), {}))
    );
}

function filterActivities(activities, endListIds, dateTypeSelector, dayOfWeek = 'monday') {
  return filterDuplicates(activities.filter((activity) => activity.type === 'updateCard')
    .filter((activity) => endListIds.includes(activity.data.listAfter.id))
    .map((activity) => ({ id: activity.data.card.id, date: getDate(activity.date, dateTypeSelector, dayOfWeek) })))
    .sort(sortDate);
}

function speedProjection(filteredActivities, startDate, endDate, toNumber = false) {
  const finalDate = (endDate === null) ? moment() : moment(endDate);
  const initialDate = (startDate === null) ? filteredActivities[0].date : startDate;
  const speed = filteredActivities.length / Math.ceil(
    filteredActivities.length === 0 ? 1 : finalDate.diff(initialDate, 'weeks', true)
  );
  if (toNumber) return speed;

  return speed.toFixed(1);
}

function excludeActivities(cards, activities, excludedLists) {
  return activities.filter((activity) => cards.filter((card) => !excludedLists.includes(card.idList))
    .map((card) => card.id)
    .includes(activity.id)
  );
}

export {
  filterActivities,
  speedProjection,
  excludeActivities,
};
