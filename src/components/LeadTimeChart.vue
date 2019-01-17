<template>
  <div class="stacked-bar-graph">
    <div class="category-container">
      <p class="category-text">Time To Live ({{ timeToLive.toLocaleString({maximumFractionDigits: 2}) }})</p>
      <div class="category-line category-line-top"></div>
    </div>
    <div v-if="responseTime !== '0'" class="bar-1" :style="responseWidth">{{ responseTime }}</div>
    <div v-if="cycleTime !== '0'" class="bar-2" :style="cycleWidth">{{ cycleTime }}</div>
    <div v-if="deployTime !== '0'" class="bar-3" :style="deployWidth">{{ deployTime }}</div>
    <div v-if="responseTime !== '0'" class="category-container" :style="responseWidth">
      <div class="category-line category-line-bottom"></div>
      <p class="category-text">Response Time</p>
    </div>
    <div v-if="cycleTime !== '0'" class="category-container" :style="cycleWidth">
      <div class="category-line category-line-bottom"></div>
      <p class="category-text">Cycle Time</p>
    </div>
    <div v-if="deployTime !== '0'" class="category-container" :style="deployWidth">
      <div class="category-line category-line-bottom"></div>
      <p class="category-text">Deploy Time</p>
    </div>
    <div class="category-container" :style="leadWidth">
      <div class="category-line category-line-bottom"></div>
      <p class="category-text">Lead Time ({{ leadTime.toLocaleString({maximumFractionDigits: 2}) }})</p>
    </div>
  </div>
</template>

<script>
import { getAverageTime, getCardsBetweenTwoLists } from '../utils/timeBetweenLists.js';

const percentage = 100;

export default {
  name: 'LeadTImeChart',
  props: {
    filteredActivities: {
      type: Array,
      default: null,
    },
    cardActivities: Array,
    endListIds: Array,
    progressListIds: Array,
    backlogListIds: Array,
    productionListIds: Array,
  },
  data() {
    return {
      responseTime: 0,
      cycleTime: 0,
      deployTime: 0,
    };
  },
  computed: {
    timeToLive() {
      return (parseFloat(this.responseTime) + parseFloat(this.cycleTime) + parseFloat(this.deployTime));
    },
    leadTime() {
      return (parseFloat(this.responseTime) + parseFloat(this.cycleTime));
    },
    responseWidth() {
      return { width: `${(parseFloat(this.responseTime) / this.timeToLive) * percentage}%` };
    },
    cycleWidth() {
      return { width: `${(parseFloat(this.cycleTime) / this.timeToLive) * percentage}%` };
    },
    deployWidth() {
      return { width: `${(parseFloat(this.deployTime) / this.timeToLive) * percentage}%` };
    },
    leadWidth() {
      return {
        width: `${((parseFloat(this.responseTime) + parseFloat(this.cycleTime)) / this.timeToLive) * percentage}%`,
      };
    },
  },
  mounted() {
    this.calculate();
  },
  methods: {
    calculate() {
      this.responseTime = getAverageTime(
        ...getCardsBetweenTwoLists(this.cardActivities, this.backlogListIds, this.progressListIds)
      );
      if (this.responseTime === 'NaN') this.responseTime = '0';
      this.cycleTime = getAverageTime(
        ...getCardsBetweenTwoLists(this.cardActivities, this.progressListIds, this.endListIds)
      );
      if (this.cycleTime === 'NaN') this.cycleTime = '0';
      this.deployTime = getAverageTime(
        ...getCardsBetweenTwoLists(this.cardActivities, this.endListIds, this.productionListIds)
      );
      if (this.deployTime === 'NaN') this.deployTime = '0';
    },
  },
  watch: {
    cardActivities() {
      this.calculate();
    },
  },
};
</script>

<style>
.stacked-bar-graph {
  margin: 2%;
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
}
.bar-1 {
  background-color: #42e2f4;
  font-size: 5em;
  width: 20%;
}

.bar-2 {
  background: #f4e541;
  font-size: 5em;
}

.bar-3 {
  background: orange;
  font-size: 5em;
}

.category-container {
  width: 100%;
}

.category-text {
  font-size: 30px;
  margin-bottom: 0px;
  margin-top: 0px;
}

.category-line {
  width: max-width;
  height: 10px;
  border-width: 5px;
}

.category-line-top {
  border-style: solid solid none solid;
  margin-bottom: 5px;
}

.category-line-bottom {
  border-style: none solid solid solid;
  margin-top: 5px;
}

</style>