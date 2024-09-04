// Importamos las funciones necesarias de Vue
const { createApp, ref, computed, onMounted } = Vue

// Creamos la aplicación Vue
const app = createApp({
    // Usamos la función setup para definir la lógica de nuestra aplicación
    setup() {
        // Definimos variables reactivas (ref) para almacenar el estado de nuestra aplicación
        const characters = ref([])  // Lista de personajes
        const searchText = ref('')  // Texto de búsqueda
        const filterAlive = ref(false)  // Filtro para personajes vivos
        const totalCharacters = ref(0)  // Total de personajes en la API
        const currentPage = ref('home')  // Página actual de la aplicación
        const selectedCharacter = ref(null)  // Personaje seleccionado para ver detalles
        const favorites = ref([])  // Lista de personajes favoritos
        const currentPageNumber = ref(1)  // Número de página actual en la paginación
        const totalPages = ref(0)  // Total de páginas disponibles

        // Función para obtener personajes de la API
        const fetchCharacters = async (page = 1) => {
            try {
                // Hacemos una petición a la API de Rick and Morty
                const response = await fetch(`https://rickandmortyapi.com/api/character?page=${page}`)
                const data = await response.json()
                // Actualizamos nuestras variables reactivas con los datos obtenidos
                characters.value = data.results
                totalCharacters.value = data.info.count
                totalPages.value = data.info.pages
                currentPageNumber.value = page
            } catch (error) {
                console.error('Error fetching characters:', error)
            }
        }

        // Función que se ejecuta cuando el componente se monta
        onMounted(() => {
            // Obtenemos los personajes iniciales
            fetchCharacters()
            // Recuperamos los favoritos guardados en el almacenamiento local
            const storedFavorites = localStorage.getItem('favorites')
            if (storedFavorites) {
                favorites.value = JSON.parse(storedFavorites)
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

        // Función para mostrar detalles de un personaje
        const showDetails = (character) => {
            selectedCharacter.value = character
            currentPage.value = 'details'
        }

        // Función para añadir un personaje a favoritos
        const addToFavorites = (character) => {
            if (!favorites.value.some(fav => fav.id === character.id)) {
                favorites.value.push(character)
                saveFavorites()
            }
        }

        // Función para eliminar un personaje de favoritos
        const removeFromFavorites = (character) => {
            favorites.value = favorites.value.filter(fav => fav.id !== character.id)
            saveFavorites()
        }

        // Función para guardar favoritos en el almacenamiento local
        const saveFavorites = () => {
            localStorage.setItem('favorites', JSON.stringify(favorites.value))
        }

        // Función para abrir el modal de favoritos
        const openFavoritesModal = () => {
            const modal = new bootstrap.Modal(document.getElementById('favoritesModal'))
            modal.show()
        }

        // Función para cambiar de página en la paginación
        const goToPage = (page) => {
            if (page >= 1 && page <= totalPages.value) {
                fetchCharacters(page)
            }
        }

        // Computed property para calcular el rango de páginas a mostrar
        const paginationRange = computed(() => {
            const range = []
            for (let i = Math.max(1, currentPageNumber.value - 2); i <= Math.min(totalPages.value, currentPageNumber.value + 2); i++) {
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
            paginationRange
        }
    }
})

// Montamos la aplicación en el elemento con id 'app'
app.mount('#app')