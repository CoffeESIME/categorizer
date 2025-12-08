/**
 * Tests for categorizerAPI file upload and task status methods.
 */
import categorizerAPI from '../app/utils/categorizerAPI';
import axios from 'axios';

// Mock axios
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('categorizerAPI', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('uploadFiles', () => {
        it('should upload files and return metadata', async () => {
            const mockResponse = {
                data: {
                    files: [
                        {
                            id: 1,
                            original_name: 'test.jpg',
                            location: 'images/test.jpg',
                            file_url: 'http://minio/bucket/images/test.jpg?sig=xxx',
                            status: 'uploaded',
                            file_type: 'image/jpeg',
                        },
                    ],
                },
            };

            mockedAxios.post.mockResolvedValueOnce(mockResponse);

            const mockFile = new File(['content'], 'test.jpg', { type: 'image/jpeg' });
            const files = [
                {
                    id: 'test-id',
                    file: mockFile,
                    original_name: 'test.jpg',
                    status: 'pending' as const,
                    file_type: 'image/jpeg',
                },
            ];

            const result = await categorizerAPI.uploadFiles(files);

            expect(mockedAxios.post).toHaveBeenCalledTimes(1);
            expect(result).toHaveLength(1);
            expect(result[0].original_name).toBe('test.jpg');
            expect(result[0].file_url).toContain('http://minio');
        });

        it('should handle upload errors', async () => {
            mockedAxios.post.mockRejectedValueOnce(new Error('Network error'));

            const mockFile = new File(['content'], 'test.jpg', { type: 'image/jpeg' });
            const files = [
                {
                    id: 'test-id',
                    file: mockFile,
                    original_name: 'test.jpg',
                    status: 'pending' as const,
                },
            ];

            await expect(categorizerAPI.uploadFiles(files)).rejects.toThrow('Network error');
        });
    });

    describe('getTaskStatus', () => {
        it('should fetch task statuses for given task IDs', async () => {
            const mockResponse = {
                data: {
                    'task-1': { status: 'SUCCESS', result: null },
                    'task-2': { status: 'PENDING', result: null },
                },
            };

            mockedAxios.get.mockResolvedValueOnce(mockResponse);

            const result = await categorizerAPI.getTaskStatus(['task-1', 'task-2']);

            expect(mockedAxios.get).toHaveBeenCalledTimes(1);
            expect(mockedAxios.get).toHaveBeenCalledWith(
                expect.stringContaining('/tasks/status/'),
                expect.objectContaining({
                    params: { ids: 'task-1,task-2' },
                })
            );
            expect(result['task-1'].status).toBe('SUCCESS');
            expect(result['task-2'].status).toBe('PENDING');
        });

        it('should handle status fetch errors', async () => {
            mockedAxios.get.mockRejectedValueOnce(new Error('Server error'));

            await expect(categorizerAPI.getTaskStatus(['task-1'])).rejects.toThrow('Server error');
        });
    });

    describe('getFiles', () => {
        it('should fetch files with optional filters', async () => {
            const mockResponse = {
                data: {
                    files: [
                        { id: 1, original_name: 'test.jpg', status: 'pending' },
                    ],
                },
            };

            mockedAxios.get.mockResolvedValueOnce(mockResponse);

            const result = await categorizerAPI.getFiles({ types: ['image'] });

            expect(mockedAxios.get).toHaveBeenCalledTimes(1);
            expect(result).toHaveLength(1);
        });
    });
});
