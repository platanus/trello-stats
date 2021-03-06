import moment from 'moment';
import { addToDate, getDate, subtractToDate } from './dateManager.js';
import { excludeActivities } from './speedUtil.js';

moment().format('yyyy-MM-dd');

const globalColors = [
  ['rgba(255, 0, 0, 0.1)', 'rgba(255, 0, 0, 0.5)'],
  ['rgba(0, 255, 0, 0.1)', 'rgba(0, 255, 0, 0.5)'],
  ['rgba(0, 0, 255, 0.1)', 'rgba(0, 0, 255, 0.5)'],
  ['rgba(244, 244, 65, 0.1)', 'rgba(244, 244, 65, 0.5)'],
  ['rgba(244, 124, 65, 0.1)', 'rgba(244, 124, 65, 0.5)'],
  ['rgba(65, 244, 211, 0.1)', 'rgba(65, 244, 211, 0.5)'],
  ['rgba(160, 65, 244, 0.1)', 'rgba(160, 65, 244, 0.5)'],
];

const globalColorsDash = [
  ['rgba(255, 0, 0, 0.5)', 'rgba(255, 0, 0, 0.5)'],
  ['rgba(0, 255, 0, 0.5)', 'rgba(0, 255, 0, 0.5)'],
  ['rgba(0, 0, 255, 0.5)', 'rgba(0, 0, 255, 0.5)'],
  ['rgba(244, 244, 65, 0.5)', 'rgba(244, 244, 65, 0.5)'],
  ['rgba(244, 124, 65, 0.5)', 'rgba(244, 124, 65, 0.5)'],
  ['rgba(65, 244, 211, 0.5)', 'rgba(65, 244, 211, 0.5)'],
  ['rgba(160, 65, 244, 0.5)', 'rgba(160, 65, 244, 0.5)'],
];

let globalColorIndex = 0;

function getColor(color, index = undefined) {
  let colorArray;
  let realIndex;
  switch (color) {
  case 'random':
    colorArray = globalColors[globalColorIndex];
    globalColorIndex = (globalColorIndex + 1) % globalColors.length;
    break;
  case 'randomDash':
    realIndex = index % globalColors.length;
    colorArray = globalColorsDash[realIndex];
    break;
  case 'blue':
    colorArray = ['rgba(0, 0, 255, 1)', 'rgba(0, 0, 255, 1)'];
    break;
  case 'red':
    colorArray = ['rgba(255, 0, 0, 1)', 'rgba(255, 0, 0, 1)'];
    break;
  case 'green':
    colorArray = ['rgba(0, 255, 0, 1)', 'rgba(0, 255, 0, 1)'];
    break;
  case 'black':
    colorArray = ['rgba(0, 0, 0, 1)', 'rgba(0, 0, 0, 1)'];
    break;
  case 'orange':
    colorArray = ['rgba(242, 132, 14, 0.5)', 'rgba(242, 132, 14, 0.5)'];
    break;
  case 'fullOrange':
    colorArray = ['rgba(242, 132, 14, 1)', 'rgba(242, 132, 14, 1)'];
    break;
  case 'bugRed':
    colorArray = ['rgba(255, 0, 0, 1)', 'rgba(255, 0, 0, 0.5)'];
    break;
  case 'speedBlue':
    colorArray = ['rgba(0, 0, 255, 0.5)', 'rgba(0, 0, 255, 1)'];
    break;
  default:
    colorArray = globalColors[globalColorIndex];
    globalColorIndex = (globalColorIndex + 1) % globalColors.length;
    break;
  }

  return colorArray;
}

function getLabels(activities) {
  return activities.map((element) => element.date)
    .filter((value, index, self) => self.indexOf(value) === index)
    .sort();
}

function countCardsByDate(activities, date) {
  return activities.filter((activity) => activity.date === date).length;
}

function buildChartDataSet(filteredActivities, labels, datasetName, lineParams = { color: 'random', fill: true }) {
  if (filteredActivities.length === 0) {
    return {
      label: [],
      data: [],
    };
  }
  const datasetValues = labels.map((label) => countCardsByDate(filteredActivities, label))
    .reduce((a, b, index) => [...a, b + (a[index - 1] || 0)], []);

  const colors = getColor(lineParams.color);

  return {
    label: datasetName,
    data: datasetValues,
    fill: lineParams.fill,
    backgroundColor: colors[0],
    borderColor: colors[1],
    cubicInterpolationMode: 'monotone',
  };
}

function buildChartDataSets(activities, labels, listIds, cards) {
  globalColorIndex = 0;

  return listIds.map(
    (listId, index) => buildChartDataSet(
      excludeActivities(
        cards,
        activities.filter((activity) => listId === activity.list.id),
        listIds.slice(0, index)
      ),
      labels,
      activities.filter((activity) => listId === activity.list.id).length > 0 ?
        activities.filter((activity) => listId === activity.list.id)[0].list.name :
        ''
    )
  );
}

function increaseLabels(dateLabels, index, nextLabel) {
  dateLabels.splice(index + 1, 0, nextLabel);
}

function increaseDataset(datasetData, index, isTheStart, isStartDate) {
  datasetData.splice(
    index + 1,
    0,
    isStartDate ? 0 : datasetData[isTheStart ? index : index + 1]
  );
}

function fillGap(datasetObject, index, nextLabel, properties) {
  if (properties.multipleDatasets) {
    if (!datasetObject.dateLabels.includes(nextLabel)) {
      increaseLabels(datasetObject.dateLabels, index, nextLabel);
      Object.values(datasetObject.datasetData).map((dataset) =>
        increaseDataset(dataset.data, index, properties.isTheStart, properties.isStartDate)
      );
    }
  } else {
    if (!datasetObject.dateLabels.includes(nextLabel)) {
      increaseLabels(datasetObject.dateLabels, index, nextLabel);
      increaseDataset(datasetObject.datasetData, index, properties.isTheStart, properties.isStartDate);
    }
  }
}

function fillFromStartDate(dateLabels, datasetData, dateParams, multipleDatasets) {
  if (dateLabels.length === 0) return;
  let index = -1;
  let nextLabel = getDate(
    dateParams.startDate,
    dateParams.dateTypeSelector,
    dateParams.dayOfWeek,
    true
  );
  while (!dateLabels.includes(nextLabel)) {
    fillGap({ dateLabels, datasetData }, index, nextLabel, { multipleDatasets, isTheStart: false, isStartDate: true });
    nextLabel = addToDate(nextLabel, 1, dateParams.dateTypeSelector, dateParams.dayOfWeek);
    index++;
  }
}

function fillDatasetGaps(dateLabels, datasetData, dateParams, multipleDatasets) {
  if (dateLabels.length === 0) return;
  let index = 0;
  const lastLabel = getDate(
    subtractToDate(dateParams.endDate, 1, dateParams.dateTypeSelector, { dayOfWeek: dateParams.dayOfWeek }),
    dateParams.dateTypeSelector,
    dateParams.dayOfWeek,
    true
  );
  let currentLabel = dateLabels[index];
  let nextLabel;
  while (moment(currentLabel).isSameOrBefore(lastLabel, 'day')) {
    nextLabel = addToDate(currentLabel, 1, dateParams.dateTypeSelector, dateParams.dayOfWeek);
    fillGap({ dateLabels, datasetData }, index, nextLabel, { multipleDatasets, isTheStart: true, isStartDate: false });
    index++;
    currentLabel = dateLabels[index];
  }
}

export {
  getLabels,
  buildChartDataSets,
  buildChartDataSet,
  getColor,
  fillDatasetGaps,
  fillFromStartDate,
};
