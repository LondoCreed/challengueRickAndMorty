// Importamos las funciones necesarias de Vue
const { createApp, ref, computed, onMounted, watch } = Vue

// Creamos la aplicación Vue
const app = createApp({
    // Usamos la función setup para definir la lógica de nuestra aplicación
    setup() {
        // Variables reactivas para el estado de la aplicación
        const characters = ref([])              // Lista de personajes
        const searchText = ref('')              // Texto de búsqueda
        const filterAlive = ref(false)          // Filtro para personajes vivos
        const totalCharacters = ref(0)          // Total de personajes en la API
        const currentPage = ref('home')         // Página actual de la aplicación
        const selectedCharacter = ref(null)     // Personaje seleccionado para ver detalles
        const favorites = ref([])               // Lista de personajes favoritos
        const currentPageNumber = ref(1)        // Número de página actual en la paginación de personajes
        const totalPages = ref(0)               // Total de páginas disponibles para personajes
        const episodes = ref([])                // Lista de episodios
        const currentEpisodePage = ref(1)       // Número de página actual en la paginación de episodios
        const totalEpisodePages = ref(0)        // Total de páginas disponibles para episodios

        /**
         * Obtiene personajes de la API de Rick and Morty
         * @param {number} page - Número de página a obtener (por defecto 1)
         */
        const fetchCharacters = async (page = 1) => {
            try {
                const response = await fetch(`https://rickandmortyapi.com/api/character?page=${page}`)
                const data = await response.json()
                characters.value = data.results
                totalCharacters.value = data.info.count
                totalPages.value = data.info.pages
                currentPageNumber.value = page
            } catch (error) {
                console.error('Error fetching characters:', error)
            }
        }

        /**
         * Obtiene episodios de la API de Rick and Morty
         * @param {number} page - Número de página a obtener (por defecto 1)
         */
        const loadEpisodes = async (page = 1) => {
            try {
                const response = await fetch(`https://rickandmortyapi.com/api/episode?page=${page}`)
                const data = await response.json()
                episodes.value = data.results
                totalEpisodePages.value = data.info.pages
                currentEpisodePage.value = page
            } catch (error) {
                console.error('Error fetching episodes:', error)
            }
        }

        // Inicialización al montar el componente
        onMounted(() => {
            fetchCharacters()
            const storedFavorites = localStorage.getItem('favorites')
            if (storedFavorites) {
                favorites.value = JSON.parse(storedFavorites)
            }
        })

        // Observa los cambios en currentPage y carga los episodios cuando se cambia a la página de episodios
        watch(() => currentPage.value, (newValue) => {
            if (newValue === 'episodes') {
                loadEpisodes(1)
            }
        })

        // Computed property para filtrar personajes
        const filteredCharacters = computed(() => {
            return characters.value.filter(character => {
                const matchesSearch = character.name.toLowerCase().includes(searchText.value.toLowerCase())
                const matchesFilter = !filterAlive.value || character.status === 'Alive'
                return matchesSearch && matchesFilter
            })
        })

        /**
         * Muestra los detalles de un personaje
         * @param {Object} character - Personaje seleccionado
         */
        const showDetails = (character) => {
            selectedCharacter.value = character
            currentPage.value = 'details'
        }

        /**
         * Añade un personaje a favoritos
         * @param {Object} character - Personaje a añadir
         */
        const addToFavorites = (character) => {
            if (!favorites.value.some(fav => fav.id === character.id)) {
                favorites.value.push(character)
                saveFavorites()
            }
        }

        /**
         * Elimina un personaje de favoritos
         * @param {Object} character - Personaje a eliminar
         */
        const removeFromFavorites = (character) => {
            favorites.value = favorites.value.filter(fav => fav.id !== character.id)
            saveFavorites()
        }

        // Guarda los favoritos en el almacenamiento local
        const saveFavorites = () => {
            localStorage.setItem('favorites', JSON.stringify(favorites.value))
        }

        // Abre el modal de favoritos
        const openFavoritesModal = () => {
            const modal = new bootstrap.Modal(document.getElementById('favoritesModal'))
            modal.show()
        }

        /**
         * Cambia a una página específica en la paginación de personajes
         * @param {number} page - Número de página a la que ir
         */
        const goToPage = (page) => {
            if (page >= 1 && page <= totalPages.value) {
                fetchCharacters(page)
            }
        }

        /**
         * Cambia a una página específica en la paginación de episodios
         * @param {number} page - Número de página a la que ir
         */
        const goToEpisodePage = (page) => {
            if (page >= 1 && page <= totalEpisodePages.value) {
                loadEpisodes(page)
            }
        }

        // Computed property para calcular el rango de páginas a mostrar para personajes
        const paginationRange = computed(() => {
            const range = []
            for (let i = Math.max(1, currentPageNumber.value - 2); i <= Math.min(totalPages.value, currentPageNumber.value + 2); i++) {
                range.push(i)
            }
            return range
        })

        // Computed property para calcular el rango de páginas a mostrar para episodios
        const episodePaginationRange = computed(() => {
            const range = []
            for (let i = Math.max(1, currentEpisodePage.value - 2); i <= Math.min(totalEpisodePages.value, currentEpisodePage.value + 2); i++) {
                range.push(i)
            }
            return range
        })

        // Retornamos todas las variables y funciones que queremos exponer al template
        return {
            characters,
            searchText,
            filterAlive,
            totalCharacters,
            currentPage,
            selectedCharacter,
            favorites,
            currentPageNumber,
            totalPages,
            filteredCharacters,
            showDetails,
            addToFavorites,
            removeFromFavorites,
            openFavoritesModal,
            goToPage,
            paginationRange,
            episodes,
            currentEpisodePage,
            totalEpisodePages,
            loadEpisodes,
            goToEpisodePage,
            episodePaginationRange
        }
    }
})

// Montamos la aplicación en el elemento con id 'app'
app.mount('#app')