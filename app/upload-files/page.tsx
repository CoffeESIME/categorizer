"use client";
import { useState, useCallback, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import { TitleComponent } from "../components/TitleComponent/TtitleComponent";
import BrutalButton from "../components/ButtonComponent/ButtonComponent";
import { ButtonLink } from "../components/ButtonLink/ButtonLink";
import categorizerAPI from "../utils/categorizerAPI";
import CustomCheckbox from "../components/CheckBoxComponent/CheckBoxComponent";
import { FileItem, useFileStore } from "../store/filestore";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";

export default function MultipleFileUpload() {
  const [step, setStep] = useState<0 | 1 | 2 | 3>(0);
  const [uploading, setUploading] = useState(false);
  const [filterType, setFilterType] = useState<string>("all");
  const { t } = useTranslation();

  const {
    files,
    addFiles,
    updateFilePath,
    clearFiles,
    toggleSelection,
    toggleAllSelection,
    getSelectedFiles,
    filterByType,
    setFiles,
  } = useFileStore();

  useEffect(() => {
    setFiles([]);
    setStep(1);
  }, []);
  const router = useRouter();
  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const newFiles: FileItem[] = acceptedFiles.map((file) => ({
        file,
        id: file.name,
        selected: false,
        original_name: file.name,
        status: "pending",
        file_type: file.type,
      }));
      addFiles(newFiles);
    },
    [addFiles]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: true,
  });

  const handleUpload = async () => {
    if (files.length === 0) return;

    setUploading(true);
    try {
      const fileObjects = files;
      const uploadedFiles = await categorizerAPI.uploadFiles(fileObjects);
      uploadedFiles.forEach((fileMetadata) => {
        const matchingFile = files.find(
          (f) =>
            f.original_name.toLowerCase().trim() ===
            fileMetadata.original_name.toLocaleLowerCase().trim()
        );
        if (matchingFile) {
          updateFilePath(matchingFile.id, fileMetadata.location);
        }
      });

      setStep(2);
    } catch (error) {
      console.error("Error al subir archivos:", error);
      alert(t("upload.uploadError"));
    } finally {
      setUploading(false);
    }
  };

  const getFilteredFiles = () => filterByType(filterType);

  const getUniqueFileTypes = () => {
    const types = new Set<string>();
    files.forEach((file) => {
      const mainType = file.file_type!.split("/")[0];
      types.add(mainType);
    });
    return Array.from(types);
  };

  const handleProcessFiles = async () => {
    const selectedFiles = getSelectedFiles();
    if (selectedFiles.length === 0) {
      alert(t("upload.selectAtLeastOne"));
      return;
    }
    router.push("/processing");
  };

  return (
    <div className="container mx-auto p-4 min-h-screen flex flex-col items-center justify-center bg-yellow-100">
      <TitleComponent title={t("upload.title")} variant="neobrutalism" />
      <div className="max-w-3xl mx-auto p-4 border-4 border-black bg-white rounded-lg space-y-6">
        {step === 1 && (
          <div>
            <h2 className="text-2xl font-bold mb-4">{t("upload.step1")}</h2>
            <div
              {...getRootProps()}
              className={`p-6 border-4 border-black rounded-lg text-center cursor-pointer text-2xl ${
                isDragActive ? "bg-green-300" : "bg-blue-300"
              }`}
            >
              <input {...getInputProps()} />
              {files.length > 0 ? (
                <p>{t("upload.filesSelected", { count: files.length })}</p>
              ) : (
                <p className="text-lg font-bold">
                  {t("upload.dragDrop")}, {t("upload.browse")}
                </p>
              )}
            </div>

            {files.length > 0 && (
              <div className="mt-4 border-2 border-black p-3 rounded-lg max-h-60 overflow-y-auto">
                  <h3 className="text-lg font-bold mb-2">
                    {t("upload.selectedFilesTitle")}
                  </h3>
                <ul className="space-y-2">
                  {files.map((fileItem) => (
                    <li
                      key={fileItem.id}
                      className="flex items-center justify-between p-2 border-b border-gray-300"
                    >
                      <span className="text-sm font-medium truncate max-w-xs">
                        {fileItem.file!.name} (
                        {(fileItem.file!.size / 1024).toFixed(2)} KB)
                      </span>
                      <span className="text-xs bg-gray-200 px-2 py-1 rounded">
                        {fileItem.file_type}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="mt-4 flex justify-between">
              <BrutalButton
                onClick={() => clearFiles()}
                disabled={files.length === 0}
                variant="red"
              >
                {t("upload.clearAll")}
              </BrutalButton>
              <BrutalButton
                onClick={handleUpload}
                disabled={files.length === 0 || uploading}
                variant="blue"
              >
                {uploading ? t("upload.uploading") : t("upload.title")}
              </BrutalButton>
            </div>
          </div>
        )}

        {step === 2 && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <BrutalButton
                onClick={() => setStep(1)}
                variant="gray"
                className="text-black"
              >
                {t("general.back")}
              </BrutalButton>
              <h2 className="text-2xl font-bold">{t("upload.step2")}</h2>
            </div>

            <div className="mb-4 flex items-center space-x-2">
              <span className="font-medium">{t("upload.filterByType")}</span>
              <select
                className="p-2 border-3 border-black rounded-lg bg-purple-200"
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
              >
                <option value="all">{t("upload.allTypes")}</option>
                {getUniqueFileTypes().map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>

              <BrutalButton
                onClick={() => toggleAllSelection(true)}
                variant="teal"
                className="ml-auto"
              >
                {t("upload.selectAll")}
              </BrutalButton>
              <BrutalButton
                onClick={() => toggleAllSelection(false)}
                variant="green"
              >
                {t("upload.deselectAll")}
              </BrutalButton>
            </div>

            <div className="border-2 border-black p-3 rounded-lg max-h-96 overflow-y-auto">
              <h3 className="text-lg font-bold mb-2">{t("upload.availableFiles")}</h3>
              {getFilteredFiles().length > 0 ? (
                <ul className="space-y-2">
                  {getFilteredFiles().map((fileItem) => (
                    <li
                      key={fileItem.id}
                      className={`flex items-center justify-between p-2 border-b border-gray-300 rounded ${
                        fileItem.selected ? "bg-green-100" : ""
                      }`}
                    >
                      <div className="flex items-center">
                        <CustomCheckbox
                          onChange={() => toggleSelection(fileItem.id)}
                          checked={fileItem.selected}
                          label={fileItem.file!.name}
                        />
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs bg-gray-200 px-2 py-1 rounded">
                          {fileItem.file_type}
                        </span>
                        {fileItem.file_url && (
                          <span className="text-xs bg-green-200 px-2 py-1 rounded">
                            {t("upload.uploaded")}
                          </span>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-center py-4">
                  {t("upload.noFilesMatch")}
                </p>
              )}
            </div>

            <div className="mt-4 flex justify-between">
              <span className="font-bold">
                {t("upload.selectedCount", {
                  selected: getSelectedFiles().length,
                  total: files.length,
                })}
              </span>
              <BrutalButton
                onClick={handleProcessFiles}
                disabled={getSelectedFiles().length === 0}
                variant="green"
              >
                {t("upload.processSelected")}
              </BrutalButton>
            </div>
          </div>
        )}
      </div>
      <div className="mt-4 flex justify-center">
        <ButtonLink href="/" variant="outline" size="lg">
          <p className="text-xl">{t("nav.home")}</p>
        </ButtonLink>
      </div>
    </div>
  );
}
