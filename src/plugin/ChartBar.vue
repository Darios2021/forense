<template>
  <v-container fluid>
    <!-- Tendencia: Solicitudes por día -->
    <v-card class="pa-4 mb-6">
      <h3 class="text-h6 mb-4">Solicitudes por día</h3>
      <LineChart :chart-data="lineData" :options="lineOptions" />
    </v-card>

    <!-- Distribución: Solicitudes por Técnico -->
    <v-card class="pa-4">
      <h3 class="text-h6 mb-4">Top Técnicos</h3>
      <BarChart :chart-data="barData" :options="barOptions" />
    </v-card>
  </v-container>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  LineElement,
  BarElement,
  CategoryScale,
  LinearScale,
  PointElement
} from 'chart.js';
import { defineChartComponent } from 'vue-chartjs';

// 1) Registrar componentes de Chart.js
ChartJS.register(
  Title,
  Tooltip,
  Legend,
  LineElement,
  BarElement,
  CategoryScale,
  LinearScale,
  PointElement
);

// 2) Crear componentes reusables
const LineChart = defineChartComponent('line');
const BarChart  = defineChartComponent('bar');

// 3) Datos reactivos
const lineData = ref({ labels: [], datasets: [] });
const barData  = ref({ labels: [], datasets: [] });

// 4) Opciones básicas
const lineOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: { legend: { position: 'top' } }
};
const barOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: { legend: { display: false } }
};

// 5) Carga de datos simulada
onMounted(async () => {
  // Historial de solicitudes
  const trend = await fetch('/api/solicitudes/trend?range=30').then(r => r.json());
  lineData.value = {
    labels: trend.map(i => i.fecha),
    datasets: [{
      label: 'Solicitudes',
      data:    trend.map(i => i.cantidad),
      tension: 0.4,
      fill:    true
    }]
  };

  // Top técnicos
  const topTech = await fetch('/api/solicitudes/by-tecnico?top=5').then(r => r.json());
  barData.value = {
    labels: topTech.map(i => i.tecnico),
    datasets: [{
      label: 'Solicitudes',
      data:    topTech.map(i => i.total),
      backgroundColor: 'rgba(75, 192, 192, 0.6)'
    }]
  };
});
</script>

<style scoped>
v-card {
  height: 300px;
}
</style>
